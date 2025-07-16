import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FaCopy, FaCheck, FaSpinner, FaSun, FaMoon, FaSync, FaPlayCircle, FaPaperPlane, FaTerminal } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';



// Language templates for different programming languages
const languageTemplates = {
  cpp: `#include<bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
  java: `import java.util.*;

class Main {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here

        sc.close();
    }
}`,
  python: `# Write your solution here
`
};

function ProblemSolving() {
  // State variables for the component
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isLoading, setIsLoading] = useState(true);
  const [isProblemLoading, setIsProblemLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [consoleTab, setConsoleTab] = useState('input');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [showConsole, setShowConsole] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1000);
  const [copyStatus, setCopyStatus] = useState({ input: false, output: false });
  
  // AI Help states
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeature, setAiFeature] = useState('hints');
  const [hasAttemptedSubmission, setHasAttemptedSubmission] = useState(false);
  
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { problemId } = useParams(); // Get problem ID from URL
  const sampleInputRef = useRef(null);
  const sampleOutputRef = useRef(null);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const verdictRef = useRef(null);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Copy to clipboard function
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus((prevStatus) => ({
        ...prevStatus,
        [type]: true,
      }));
      setTimeout(() => {
        setCopyStatus((prevStatus) => ({
          ...prevStatus,
          [type]: false,
        }));
      }, 1000);
    });
  };

  // Fetch problem details when component loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProblem();
    fetchSubmissionHistory();
  }, [problemId, navigate]);

  // Set initial code template when language or problem changes
  useEffect(() => {
    if (language) {
      setCode(languageTemplates[language]);
    }
  }, [language]);

  // Fetch problem details from the backend
  const fetchProblem = async () => {
    setIsProblemLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/problems/${problemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblem(data.problem);
        setTestInput(data.problem.sampleInput || '');
      } else {
        toast.error('Failed to fetch problem details');
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast.error('Error loading problem details');
    } finally {
      setIsProblemLoading(false);
      setIsLoading(false);
    }
  };

  // Fetch submission history for this problem
  const fetchSubmissionHistory = async () => {
    try {
      const userId = localStorage.getItem('loggedInUser');
      const judgeUrl = `${import.meta.env.VITE_COMPILER_URL}/judge/submissions/${problemId}?userId=${userId}`;
      
      const { data } = await axios.get(judgeUrl);
      
      if (data.success && data.submissions) {
        setSubmissionHistory(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submission history:', error);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    if (code !== languageTemplates[language]) {
      if (window.confirm('Changing the language will reset your code. Continue?')) {
        setLanguage(newLanguage);
      }
    } else {
      setLanguage(newLanguage);
    }
  };

  // Map our language keys to Monaco language identifiers
  const getMonacoLanguage = () => {
    switch (language) {
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'python': return 'python';
      default: return 'cpp';
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Disable command palette keybindings
    editor.addCommand(monaco.KeyCode.F1, () => {
      // Prevent F1 from opening command palette
    });
    
    // Disable Ctrl+Shift+P (Command Palette)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      // Prevent Ctrl+Shift+P from opening command palette
    });
  };

  // Run code against custom test cases
  const handleRunTest = async (e) => {
    // Prevent default form submission behavior if this is in a form
    if (e) {
      e.preventDefault();
    }
    
    if (!code.trim()) {
      setTestOutput('Error: Please write some code first!');
      toast.error('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setShowConsole(true);
    setConsoleTab('output');
    setTestOutput(
      <div className="loading-spinner">
        <FaSpinner className="animate-spin" />
      </div>
    );

    const payload = {
      language,
      code,
      input: testInput
    };

    try {
      const compilerUrl = `${import.meta.env.VITE_COMPILER_URL}/compiler/run`;
      const { data } = await axios.post(compilerUrl, payload);
      
      setTestOutput(
        <div className="output-div">
          <span className="text-blue-400 font-medium">Result:</span>
          <span className="ml-2 text-green-400 font-medium">Successful</span>
          <br />
          <span className="text-blue-400 font-medium">Output:</span>
          <br />
          <pre className="mt-1 text-gray-300 whitespace-pre-wrap">{data.output || 'No output'}</pre>
        </div>
      );
      
      // Auto-scroll to the output
      if (outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Execution error:', error);
      
      setTestOutput(
        <div className="output-div">
          <span className="text-blue-400 font-medium">Result:</span>
          <span className="ml-2 text-red-400 font-medium">Error</span>
          <br />
          <span className="text-blue-400 font-medium">Output:</span>
          <br />
          <pre className="mt-1 text-red-300 whitespace-pre-wrap">
            {error.response?.data?.error || 'Execution failed. Please check your code and try again.'}
          </pre>
        </div>
      );
      
      toast.error('Execution failed. See output for details.');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution for judging
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior if this is in a form
    if (e) {
      e.preventDefault();
    }
    
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setShowConsole(true);
    setConsoleTab('verdict');
    setHasAttemptedSubmission(true); // Mark that user has attempted a submission
    
    // Show loading spinner in verdict section
    const loadingVerdict = (
      <div className="verdict-div">
        <div className="flex items-center justify-center p-4">
          <FaSpinner className="animate-spin text-2xl text-blue-500" />
          <span className="ml-2 text-gray-300">Judging your submission...</span>
        </div>
      </div>
    );
    
    setSubmissionResult({
      status: 'Processing',
      results: [],
      loading: true
    });

    try {
      const userId = localStorage.getItem('loggedInUser');
      const judgeUrl = `${import.meta.env.VITE_COMPILER_URL}/judge/submit/${problemId}`;
      
      const payload = {
        language,
        code,
        userId,
        problemId  // Explicitly include problemId to ensure it's sent correctly
      };
      
      const { data } = await axios.post(judgeUrl, payload);
      
      if (data.success) {
        setSubmissionResult(data.submission);
        fetchSubmissionHistory(); // Refresh submission history after new submission
        
        if (data.submission.status === 'Accepted') {
          toast.success('🎉 All test cases passed!');
        } else {
          toast.warn(`${data.submission.status}: ${data.submission.testCasesPassed}/${data.submission.totalTestCases} tests passed`);
        }
        
        // Auto-scroll to the verdict and ensure it's visible
        if (verdictRef.current) {
          verdictRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Ensure console is open and verdict tab is active
        setShowConsole(true);
        setConsoleTab('verdict');
      } else {
        console.error('Submission failed:', data);
        toast.error(`Submission Error: ${data.error || 'Unknown error'}`);
        setSubmissionResult({
          status: 'Error',
          error: data.error || 'Unknown error from server',
          testCasesPassed: 0,
          totalTestCases: '?'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Set a more informative submission result
      setSubmissionResult({
        status: 'Error',
        error: error.response?.data?.error || error.message || 'Submission failed. Please try again.',
        testCasesPassed: 0,
        totalTestCases: '?'
      });
      
      if (error.response?.data?.error) {
        toast.error(`Submission Error: ${error.response.data.error}`);
      } else if (error.response?.status) {
        toast.error(`HTTP ${error.response.status}: ${error.response.statusText || 'Submission failed'}`);
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Network Error: Unable to connect to submission server');
      } else {
        toast.error(`Submission failed: ${error.message}`);
      }
      
      // Ensure verdict tab is visible even for errors
      setShowConsole(true);
      setConsoleTab('verdict');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Format date for submission history (date only, no time)
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  // Focus management for console tabs
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.focus();
    }
  }, [testOutput]);

  useEffect(() => {
    if (verdictRef.current) {
      verdictRef.current.focus();
    }
  }, [submissionResult]);

  useEffect(() => {
    if (showConsole) {
      switch (consoleTab) {
        case "input":
          if (inputRef.current) inputRef.current.focus();
          break;
        case "output":
          if (outputRef.current) outputRef.current.focus();
          break;
        case "verdict":
          if (verdictRef.current) verdictRef.current.focus();
          break;
        default:
          break;
      }
    }
  }, [showConsole, consoleTab]);

  // Reset code function
  const refreshCode = () => {
    if (window.confirm('Are you sure you want to reset your code to the template?')) {
      setCode(languageTemplates[language]);
    }
  };

  // AI Helper Functions
  const handleAiRequest = async (feature) => {
    if (!problem) {
      toast.error('Please wait for the problem to load');
      return;
    }

    setAiLoading(true);
    setAiFeature(feature);
    
    let prompt = '';
    
    switch (feature) {
      case 'hints':
        prompt = `Give ONE helpful hint for solving this coding problem. Don't give multiple hints at once, just provide one progressive hint that guides the user in the right direction without revealing the complete solution.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Constraints: ${problem.constraints}
Sample Input: ${problem.sampleInput}
Sample Output: ${problem.sampleOutput}

Provide just ONE hint that helps the user think through the problem.`;
        break;
        
      case 'feedback':
        if (!code.trim() || code === languageTemplates[language]) {
          toast.error('Please write some code first to get feedback');
          setAiLoading(false);
          return;
        }
        prompt = `Review this code and provide only constructive feedback on how to improve it. Do not provide any code or lengthy summaries, just focus on specific areas for improvement.

Problem: ${problem.title}
User's Code (${language}):
${code}

Focus your review on:
1. Logic issues and potential bugs
2. Efficiency improvements 
3. Code quality and readability issues
4. Better approaches or optimizations

Give concise, actionable feedback only.`;
        break;
        
      case 'explanation':
        if (!hasAttemptedSubmission) {
          toast.error('Solution explanation is only available after you have attempted to submit your solution');
          setAiLoading(false);
          return;
        }
        prompt = `The user has submitted code and is stuck. Explain the solution approach in simple terms without showing any code.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Sample Input: ${problem.sampleInput}
Sample Output: ${problem.sampleOutput}

Explain only:
1. The key insight needed to solve this problem
2. The general approach/algorithm 
3. Why this approach works

Keep it simple and conceptual. No code examples.`;
        break;
        
      case 'simplify':
        prompt = `Break down this problem into simple, easy-to-understand terms. Focus on the core concept.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}

Provide:
1. What the problem is asking in simple words
2. The main concept or pattern involved
3. A simple analogy or example if helpful
4. The key steps to think about

Make it beginner-friendly and clear.`;
        break;
        
      default:
        setAiLoading(false);
        return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/ai/ai-review`, {
        prompt: prompt
      });
      
      setAiResponse(response.data.result);
    } catch (error) {
      console.error('AI request error:', error);
      toast.error('Failed to get AI response. Please try again.');
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const copyAiResponse = () => {
    navigator.clipboard.writeText(aiResponse);
    toast.success('AI response copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-white">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-[50px]">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Online Judge</h1>
              <div className="space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/problems"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Problems
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome,{" "}
                <Link
                  to={`/profile/${localStorage.getItem('loggedInUser')}`}
                  className="text-blue-400 hover:text-blue-300 transition duration-200"
                >
                  {localStorage.getItem('loggedInUser')}
                </Link>
                !
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Panel Layout */}
      {isSmallScreen ? (
        <div className="flex flex-col flex-1 p-4 gap-4 min-h-0">
          <div className="flex flex-col min-h-0 overflow-hidden border border-gray-700 rounded">
            <div className="bg-gray-800 border-b border-gray-700 p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                    activeTab === 'description' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                    activeTab === 'submissions' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveTab('aihelp')}
                  className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                    activeTab === 'aihelp' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  AI Help
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-900 p-4">
              {activeTab === 'aihelp' ? (
                <div className="text-gray-300 h-full">
                  <div className="flex flex-col h-full">
                    {/* AI Feature Selection */}
                    <div className="mb-4">
                      <h2 className="text-lg font-bold mb-3 text-blue-400">AI Help</h2>
                      <div className="grid grid-cols-1 gap-2 mb-4">
                        <button
                          onClick={() => handleAiRequest('hints')}
                          disabled={aiLoading}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                        >
                          {aiLoading && aiFeature === 'hints' ? <FaSpinner className="animate-spin mr-1" /> : '💡'} Smart Hints
                        </button>
                        <button
                          onClick={() => handleAiRequest('feedback')}
                          disabled={aiLoading || !code.trim()}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                        >
                          {aiLoading && aiFeature === 'feedback' ? <FaSpinner className="animate-spin mr-1" /> : '📝'} Code Review
                        </button>
                        <button
                          onClick={() => handleAiRequest('explanation')}
                          disabled={aiLoading || !hasAttemptedSubmission}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                        >
                          {aiLoading && aiFeature === 'explanation' ? <FaSpinner className="animate-spin mr-1" /> : '📚'} Explanation
                        </button>
                        <button
                          onClick={() => handleAiRequest('simplify')}
                          disabled={aiLoading}
                          className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                        >
                          {aiLoading && aiFeature === 'simplify' ? <FaSpinner className="animate-spin mr-1" /> : '🎯'} Simplify
                        </button>
                      </div>
                    </div>

                    {/* AI Response Area */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-semibold text-gray-400">
                          {aiLoading ? 'AI is thinking...' : aiResponse ? 'AI Response:' : 'Select an option to get started'}
                        </h3>
                        {aiResponse && !aiLoading && (
                          <div className="flex gap-2">
                            <button
                              onClick={copyAiResponse}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200 flex items-center"
                            >
                              <FaCopy className="mr-1" /> Copy
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 bg-gray-800 rounded p-4 overflow-y-auto border border-gray-700 min-h-[200px]">
                        {aiLoading ? (
                          <div className="flex items-center justify-center h-32">
                            <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
                            <span className="text-lg">AI is processing your request...</span>
                          </div>
                        ) : aiResponse ? (
                          <div className="text-sm text-gray-100 leading-relaxed">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold text-blue-400 mb-4 mt-6 border-b border-gray-600 pb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-300 mb-3 mt-5" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mb-3 mt-4" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-sm font-bold text-gray-200 mb-2 mt-3" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4 text-gray-200 leading-7 text-sm" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-yellow-300" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-blue-300" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-none mb-4 space-y-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-4 space-y-2 text-gray-200" {...props} />,
                                li: ({node, ...props}) => (
                                  <li className="mb-2 text-gray-200 flex items-start" {...props}>
                                    <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                                    <span className="flex-1">{props.children}</span>
                                  </li>
                                ),
                                code: ({node, inline, ...props}) => 
                                  inline ? (
                                    <code className="font-bold text-cyan-300" style={{backgroundColor: 'transparent', padding: 0, margin: 0}} {...props} />
                                  ) : (
                                    <code className="block bg-gray-800 text-green-300 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap my-3 border border-gray-600" {...props} />
                                  ),
                                pre: ({node, ...props}) => (
                                  <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto mb-4 text-sm border border-gray-600" {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 my-4 bg-gray-800 bg-opacity-50 py-3 rounded-r italic text-gray-300" {...props} />
                                ),
                              }}
                            >
                              {aiResponse}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                            <div>
                              <div className="text-4xl mb-2">🤖</div>
                              <p>Choose an AI feature to get intelligent assistance with this problem</p>
                              <p className="text-xs mt-2">Hints • Code Review • Solution Explanation • Problem Simplification</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Other tab content would go here */}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col min-h-0 border border-gray-700 rounded">
            <div className="flex-1 relative">
              {/* Code editor will be filled in later */}
            </div>
          </div>
        </div>
      ) : (
        <PanelGroup direction="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize={50} minSize={25} maxSize={75}>
            <div className="h-full flex flex-col min-h-0 overflow-hidden border-r-0 border-gray-700">
              <div className="bg-gray-800 border-b border-gray-700 p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/problems"
                      className="text-gray-400 hover:text-blue-400 p-1 rounded transition duration-200"
                      title="Back to Problems"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('description')}
                        className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                          activeTab === 'description' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Description
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('submissions')}
                        className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                          activeTab === 'submissions' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Submissions
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('aihelp')}
                        className={`px-4 py-2 rounded-t-md text-sm font-medium ${
                          activeTab === 'aihelp' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        AI Help
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-900 p-4">
                {activeTab === 'aihelp' ? (
                  <div className="text-gray-300 h-full">
                    <div className="flex flex-col h-full">
                      {/* AI Feature Selection */}
                      <div className="mb-4">
                        <h2 className="text-lg font-bold mb-3 text-blue-400">AI Help</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          <button
                            onClick={() => handleAiRequest('hints')}
                            disabled={aiLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                          >
                            {aiLoading && aiFeature === 'hints' ? <FaSpinner className="animate-spin mr-1" /> : '💡'} Smart Hints
                          </button>
                          <button
                            onClick={() => handleAiRequest('feedback')}
                            disabled={aiLoading || !code.trim()}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                          >
                            {aiLoading && aiFeature === 'feedback' ? <FaSpinner className="animate-spin mr-1" /> : '📝'} Code Review
                          </button>
                          <button
                            onClick={() => handleAiRequest('explanation')}
                            disabled={aiLoading || !hasAttemptedSubmission}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                          >
                            {aiLoading && aiFeature === 'explanation' ? <FaSpinner className="animate-spin mr-1" /> : '📚'} Explanation
                          </button>
                          <button
                            onClick={() => handleAiRequest('simplify')}
                            disabled={aiLoading}
                            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition duration-200 flex items-center justify-center"
                          >
                            {aiLoading && aiFeature === 'simplify' ? <FaSpinner className="animate-spin mr-1" /> : '🎯'} Simplify
                          </button>
                        </div>
                      </div>

                      {/* AI Response Area */}
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-md font-semibold text-gray-400">
                            {aiLoading ? 'AI is thinking...' : aiResponse ? 'AI Response:' : 'Select an option above to get started'}
                          </h3>
                          {aiResponse && !aiLoading && (
                            <div className="flex gap-2">
                              <button
                                onClick={copyAiResponse}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200 flex items-center"
                              >
                                <FaCopy className="mr-1" /> Copy
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 bg-gray-800 rounded p-4 overflow-y-auto border border-gray-700">
                          {aiLoading ? (
                            <div className="flex items-center justify-center h-32">
                              <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
                              <span className="text-lg">AI is processing your request...</span>
                            </div>
                          ) : aiResponse ? (
                            <div className="text-sm text-gray-100 leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-blue-400 mb-4 mt-6 border-b border-gray-600 pb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-300 mb-3 mt-5" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mb-3 mt-4" {...props} />,
                                  h4: ({node, ...props}) => <h4 className="text-sm font-bold text-gray-200 mb-2 mt-3" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-4 text-gray-200 leading-7 text-sm" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold text-yellow-300" {...props} />,
                                  em: ({node, ...props}) => <em className="italic text-blue-300" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-none mb-4 space-y-2" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-4 space-y-2 text-gray-200" {...props} />,
                                  li: ({node, ...props}) => (
                                    <li className="mb-2 text-gray-200 flex items-start" {...props}>
                                      <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                                      <span className="flex-1">{props.children}</span>
                                    </li>
                                  ),
                                  code: ({node, inline, ...props}) => 
                                    inline ? (
                                      <code className="font-bold text-cyan-300" style={{backgroundColor: 'transparent', padding: 0, margin: 0}} {...props} />
                                    ) : (
                                      <code className="block bg-gray-800 text-green-300 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap my-3 border border-gray-600" {...props} />
                                    ),
                                  pre: ({node, ...props}) => (
                                    <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto mb-4 text-sm border border-gray-600" {...props} />
                                  ),
                                  blockquote: ({node, ...props}) => (
                                    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 bg-gray-800 bg-opacity-50 py-3 rounded-r italic text-gray-300" {...props} />
                                  ),
                                }}
                              >
                                {aiResponse}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                              <div>
                                <div className="text-4xl mb-2">🤖</div>
                                <p>Choose an option to get intelligent assistance with this problem</p>
                                <p className="text-xs mt-2">Hints • Code Review • Solution Explanation • Problem Simplification</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'description' ? (
                  isProblemLoading ? (
                    <div className="flex justify-center p-10">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-xl font-bold text-white">{problem?.title}</h1>
                        {problem && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            problem.difficulty === 'Easy' ? 'text-green-400 border-green-500' :
                            problem.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-500' : 
                            'text-red-400 border-red-500'
                          }`}>
                            {problem.difficulty}
                          </span>
                        )}
                        {problem?.tags && problem.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-700 px-2 py-1 rounded-full text-xs font-medium text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mb-6">
                        <p className="text-gray-300 whitespace-pre-wrap">{problem?.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-white">Input Format:</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{problem?.inputFormat}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-white">Output Format:</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{problem?.outputFormat}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-white">Constraints:</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{problem?.constraints}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center">
                          Sample Input
                          <button
                            className="ml-2 p-1 text-gray-400 hover:text-white focus:outline-none"
                            onClick={() => copyToClipboard(problem?.sampleInput, "input")}
                            title="Copy to clipboard"
                          >
                            {copyStatus.input ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                          </button>
                        </h3>
                        <pre className="bg-gray-800 p-3 rounded text-gray-300 overflow-x-auto">{problem?.sampleInput}</pre>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center">
                          Sample Output
                          <button
                            className="ml-2 p-1 text-gray-400 hover:text-white focus:outline-none"
                            onClick={() => copyToClipboard(problem?.sampleOutput, "output")}
                            title="Copy to clipboard"
                          >
                            {copyStatus.output ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                          </button>
                        </h3>
                        <pre className="bg-gray-800 p-3 rounded text-gray-300 overflow-x-auto">{problem?.sampleOutput}</pre>
                      </div>
                      
                      {problem?.explanation && (
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-white">Solution Explanation:</h3>
                          <p className="text-gray-300 whitespace-pre-wrap">{problem.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div>
                    {/* Submission History Table */}
                    {submissionHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Language</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Passed</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-900 divide-y divide-gray-800">
                              {submissionHistory.map((submission, index) => (
                                <React.Fragment key={index}>
                                  <tr className="hover:bg-gray-800">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        submission.status?.success ? 'bg-green-900 text-green-300' : 
                                        'bg-red-900 text-red-300'
                                      }`}>
                                        {submission.status?.success ? 'Accepted' : 'Wrong Answer'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                      {submission.lang === 'cpp' ? 'C++' : 
                                      submission.lang === 'java' ? 'Java' : 
                                      submission.lang === 'python' ? 'Python' : submission.lang}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                      {submission.testCasesPassed} / {submission.totalTestCases}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                      {formatDate(submission.createdAt || submission.timestamp)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      <button
                                        onClick={() => setExpandedSubmission(
                                          expandedSubmission === index ? null : index
                                        )}
                                        className="text-blue-400 hover:text-blue-300 text-xs"
                                      >
                                        {expandedSubmission === index ? 'Hide' : 'Show'} Details
                                      </button>
                                    </td>
                                  </tr>
                                  {expandedSubmission === index && (
                                    <tr>
                                      <td colSpan="5" className="px-4 py-4 bg-gray-800">
                                        <div className="space-y-4">
                                          {/* Submitted Code Section */}
                                          <div>
                                            <h4 className="text-sm font-medium text-blue-400 mb-2">Submitted Code:</h4>
                                            <div className="bg-gray-900 rounded p-3 max-h-60 overflow-y-auto">
                                              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                                {submission.code || 'Code not available'}
                                              </pre>
                                            </div>
                                          </div>
                                          
                                          {/* Test Case Results Section */}
                                          {submission.results && submission.results.length > 0 && (
                                            <div>
                                              <h4 className="text-sm font-medium text-blue-400 mb-2">Test Case Results:</h4>
                                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {submission.results.map((result, resultIndex) => (
                                                  <div key={resultIndex} className={`p-2 rounded border-l-4 ${
                                                    result.status === 'Accepted' ? 'border-green-500 bg-green-900 bg-opacity-10' : 'border-red-500 bg-red-900 bg-opacity-10'
                                                  }`}>
                                                    <div className="flex items-center justify-between">
                                                      <span className="font-medium text-xs text-white">Test Case #{result.testCaseNumber || resultIndex + 1}</span>
                                                      <span className={`text-xs px-2 py-1 rounded ${
                                                        result.status === 'Accepted' 
                                                          ? 'bg-green-900 text-green-300' 
                                                          : 'bg-red-900 text-red-300'
                                                      }`}>
                                                        {result.status}
                                                      </span>
                                                    </div>
                                                    
                                                    {result.executionTime && (
                                                      <div className="text-xs text-gray-500 mt-1">
                                                        Time: {result.executionTime}ms
                                                      </div>
                                                    )}
                                                    
                                                    {result.input !== '[Hidden]' && result.input && (
                                                      <div className="mt-2">
                                                        <div className="text-xs text-gray-400">Input:</div>
                                                        <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                                          {result.input}
                                                        </pre>
                                                      </div>
                                                    )}
                                                    
                                                    {result.status !== 'Accepted' && result.actualOutput !== '[Hidden]' && (
                                                      <div className="mt-2">
                                                        <div className="text-xs text-gray-400">Your Output:</div>
                                                        <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                                          {result.actualOutput || 'No output'}
                                                        </pre>
                                                        {result.expectedOutput !== '[Hidden]' && (
                                                          <>
                                                            <div className="text-xs text-gray-400 mt-1">Expected Output:</div>
                                                            <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                                              {result.expectedOutput}
                                                            </pre>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                    
                                                    {result.error && (
                                                      <div className="mt-2">
                                                        <div className="text-xs text-gray-400">Error:</div>
                                                        <pre className="mt-1 text-xs text-red-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                                          {result.error}
                                                        </pre>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No submissions yet.</p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="resize-handle" />
          
          <Panel>
            <div className="h-full flex flex-col">
              {/* Code Editor with Controls */}
              <div className="h-[34rem] flex flex-col">
                {/* Editor Controls - Enhanced */}
                <div className="bg-gray-800 border-b border-gray-700 p-2.5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-300">Language:</label>
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-300">Font Size:</label>
                      <select
                        className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                      >
                        {[12, 14, 16, 18, 20, 22, 24].map((size) => (
                          <option key={size} value={size}>
                            {size}px
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-300">Theme:</label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="hc-black">High Contrast</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={refreshCode}
                      className="p-1.5 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      title="Reset Code"
                    >
                      <FaSync />
                    </button>
                  </div>
                </div>
                
                {/* Code Editor */}
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage()}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    theme={theme}
                    options={{
                      fontSize: fontSize,
                      fontFamily: "'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace",
                      fontLigatures: true,
                      wordWrap: 'on',
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      bracketPairColorization: { enabled: true },
                      formatOnPaste: true,
                      formatOnType: true,
                      suggestOnTriggerCharacters: true,
                      parameterHints: { enabled: true },
                      autoClosingBrackets: 'always',
                      autoClosingQuotes: 'always',
                      renderWhitespace: 'selection',
                      renderIndentGuides: true,
                      folding: true,
                      foldingStrategy: 'indentation',
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: true,
                      smoothScrolling: true,
                      contextmenu: false,
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false
                      },
                      // Disable command palette
                      showFoldingControls: 'always',
                      links: false,
                      // Disable F1 key and command palette
                      find: {
                        seedSearchStringFromSelection: false,
                        autoFindInSelection: 'never'
                      }
                    }}
                  />
                </div>
              </div>

              {/* Console and Submission Section */}
              <div className="bg-gray-800 border-t border-gray-700 h-[28rem] flex flex-col">
                <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setConsoleTab('input')}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        consoleTab === 'input' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Input
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab('output')}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        consoleTab === 'output' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Output
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab('verdict')}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        consoleTab === 'verdict' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Verdict
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleRunTest}
                      disabled={isRunning}
                      className={`px-4 py-1 rounded text-sm font-medium ${
                        isRunning 
                          ? 'bg-blue-700 opacity-60 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white flex items-center`}
                    >
                      {isRunning && (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      <FaPlayCircle className="mr-1" /> Run
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`px-4 py-1 rounded text-sm font-medium ${
                        isSubmitting 
                          ? 'bg-green-700 opacity-60 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white flex items-center`}
                    >
                      {isSubmitting && (
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      <FaPaperPlane className="mr-1" /> Submit
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-2">
                  {/* Conditionally render content based on selected tab */}
                  {consoleTab === 'input' && (
                    <textarea
                      ref={inputRef}
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="w-full h-full bg-gray-900 text-white p-2 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700 rounded"
                      placeholder="Enter custom test input here..."
                      spellCheck="false"
                    />
                  )}
                  {consoleTab === 'output' && (
                    <div ref={outputRef} tabIndex="-1" className="w-full h-full bg-gray-900 text-white p-2 font-mono text-sm border border-gray-700 rounded overflow-auto whitespace-pre-wrap">
                      {testOutput || (
                        <span className="text-gray-500 italic">
                          Output will appear here after running your code...
                        </span>
                      )}
                    </div>
                  )}
                  {consoleTab === 'verdict' && (
                    <div ref={verdictRef} tabIndex="-1" className="w-full h-full bg-gray-900 text-white p-2 font-mono text-sm border border-gray-700 rounded overflow-y-auto">
                      {submissionResult ? (
                        <div className="text-sm">
                          <div className="mb-2 p-2 rounded-md bg-gray-800">
                            <span className="text-gray-400">Status: </span>
                            <span className={`font-semibold ${
                              submissionResult.status === 'Accepted' ? 'text-green-400' : 
                              submissionResult.status === 'Wrong Answer' ? 'text-red-400' : 
                              submissionResult.status === 'Error' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {submissionResult.status}
                            </span>
                          </div>
                          
                          {submissionResult.status === 'Processing' ? (
                            <div className="flex items-center justify-center p-4">
                              <FaSpinner className="animate-spin text-2xl text-blue-500 mr-2" />
                              <span>Judging your solution...</span>
                            </div>
                          ) : (
                            <>
                              <div className="mb-4 p-2 rounded-md bg-gray-800">
                                <span className="text-gray-400">Tests Passed: </span>
                                <span className="font-semibold">{submissionResult.testCasesPassed} / {submissionResult.totalTestCases}</span>
                              </div>
                              
                              {/* Test Case Results */}
                              {submissionResult.results && submissionResult.results.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-sm font-medium text-blue-400 mb-2">Test Case Results:</div>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {submissionResult.results.map((result, index) => (
                                    <div key={index} className={`mb-2 p-2 rounded bg-gray-800 border-l-4 border-r-0 border-t-0 border-b-0 border-solid border-opacity-70 ${
                                      result.status === 'Accepted' ? 'border-green-500' : 'border-red-500'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-white">Test Case #{result.testCaseNumber || index + 1}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          result.status === 'Accepted' 
                                            ? 'bg-green-900 text-green-300' 
                                            : 'bg-red-900 text-red-300'
                                        }`}>
                                          {result.status}
                                        </span>
                                      </div>
                                      
                                      {/* Show execution time if available */}
                                      {result.executionTime && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Time: {result.executionTime}ms
                                        </div>
                                      )}
                                      
                                      {/* Show input for non-hidden test cases */}
                                      {result.input !== '[Hidden]' && result.input && (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-400">Input:</div>
                                          <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                            {result.input}
                                          </pre>
                                        </div>
                                      )}
                                      
                                      {/* Show output details for failed test cases */}
                                      {result.status !== 'Accepted' && result.actualOutput !== '[Hidden]' && (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-400">Your Output:</div>
                                          <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                            {result.actualOutput || 'No output'}
                                          </pre>
                                          {result.expectedOutput !== '[Hidden]' && (
                                            <>
                                              <div className="text-xs text-gray-400 mt-2">Expected Output:</div>
                                              <pre className="mt-1 text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                                {result.expectedOutput}
                                              </pre>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Show error details if any */}
                                      {result.error && (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-400">Error:</div>
                                          <pre className="mt-1 text-xs text-red-300 whitespace-pre-wrap bg-gray-900 p-1 rounded">
                                            {result.error}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Error Message */}
                              {submissionResult.error && (
                                <div className="mt-4 p-2 bg-red-900 bg-opacity-20 rounded">
                                  <span className="text-red-400 text-sm font-medium">Error:</span>
                                  <pre className="mt-1 text-red-300 text-xs whitespace-pre-wrap">{submissionResult.error}</pre>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          Submit your solution to see verdict...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}

export default ProblemSolving;
