import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-dark.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

//languageTemplates
const languageTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}`,
  java: `import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Hello World!");
        sc.close();
    }
}`,
  python: `print("Hello World!")`
};

function Compiler() {
  const [code, setCode] = useState(languageTemplates.cpp);
  const [language, setLanguage] = useState('cpp');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage]);
    setOutput('');
  };

  // Fixed getHighlightLanguage function
  const getHighlightLanguage = () => {
    switch (language) {
      case 'cpp': 
        return languages.clike || languages.cpp || languages.c;
      case 'java': 
        return languages.java || languages.clike;
      case 'python': 
        return languages.python || languages.py;
      default: 
        return languages.clike || languages.javascript;
    }
  };

  // Safe highlight function
  const safeHighlight = (code) => {
    try {
      const lang = getHighlightLanguage();
      if (lang) {
        return highlight(code, lang);
      } else {
        return code;
      }
    } catch (error) {
      console.warn('Syntax highlighting failed:', error);
      return code;
    }
  };

  // Generate line numbers
  const generateLineNumbers = (code) => {
    const lines = code.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsLoading(true);
    setOutput('Running...');

    const payload = {
      language,
      code,
      input
    };

    try {
      const compilerUrl = import.meta.env.VITE_COMPILER_URL ;
      const { data } = await axios.post(compilerUrl, payload);
      setOutput(data.output || 'No output');
      toast.success('Code executed successfully!');
    } catch (error) {
      console.error('Execution error:', error);
      if (error.response?.data?.error) {
        setOutput(`Error: ${error.response.data.error}`);
      } else {
        setOutput('Execution failed. Please check your code and try again.');
      }
      toast.error('Code execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Online Judge</h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {localStorage.getItem('loggedInUser')}!
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

      {/* Header Section */}
        <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-1">
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Language Selector & Run Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    Language:
                </label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running...
                  </>
                ) : (
                  'Run Code'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Code Editor Section */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-700">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Source Code
              <span className="text-xs text-gray-400 font-normal ml-auto">
                Lines: {code.split('\n').length}
              </span>
            </h3>
          </div>
          <div className="flex-1 bg-gray-900 overflow-hidden flex">
            {/* Line Numbers */}
            <div className="bg-gray-800 border-r border-gray-700 flex-shrink-0">
              <pre 
                className="text-gray-500 text-right text-sm p-5 pr-3 font-mono leading-6 select-none"
                style={{
                  fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {generateLineNumbers(code)}
              </pre>
            </div>
            
            {/* Code Editor */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 overflow-auto">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={safeHighlight}
                  padding={20}
                  style={{
                    fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
                    fontSize: 14,
                    backgroundColor: '#111827',
                    color: '#f9fafb',
                    outline: 'none',
                    lineHeight: 1.5,
                    minHeight: '100%',
                  }}
                  className="focus:outline-none"
                  textareaClassName="focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Input/Output Section */}
        <div className="w-full lg:w-96 flex flex-col min-h-0">
          {/* Input Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Input
                <span className="text-xs text-gray-400 font-normal"></span>
              </h3>
            </div>
            <div className="flex-1 p-4 bg-gray-800 min-h-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program here..."
                className="w-full h-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none min-h-[120px]"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-gray-700">
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Output
              </h3>
            </div>
            <div className="flex-1 p-4 bg-gray-800 min-h-0">
              <div className="w-full h-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-green-400 font-mono text-sm overflow-auto resize-none min-h-[120px] whitespace-pre-wrap">
                {output || (
                  <span className="text-gray-500 italic">
                    Output will appear here after running your code...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 border-t border-gray-700 text-gray-400 text-sm py-2 px-5">
      </div>
    </div>
  );
}

export default Compiler;