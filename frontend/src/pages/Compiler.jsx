import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('off');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const editorRef = useRef(null);
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

  // Map our language keys to Monaco language identifiers
  const getMonacoLanguage = () => {
    switch (language) {
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'python': return 'python';
      default: return 'cpp';
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      bracketPairColorization: { enabled: true },
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      renderWhitespace: 'boundary',
      renderIndentGuides: true,
      folding: true,
      foldingStrategy: 'indentation',
    });

    // Add custom keybindings
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleSubmit(),
    });

    editor.addAction({
      id: 'format-code',
      label: 'Format Code',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument').run();
      },
    });

    // Add language-specific completions
    if (language === 'cpp') {
      monaco.languages.registerCompletionItemProvider('cpp', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          return {
            suggestions: [
              {
                label: 'vector',
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: 'vector<${1:int}> ${2:name};',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range
              },
              {
                label: 'for_loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range
              },
              {
                label: 'while_loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'while (${1:condition}) {\n\t$0\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range
              },
              {
                label: 'if_statement',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'if (${1:condition}) {\n\t$0\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range
              }
            ]
          };
        }
      });
    }

    // Add command palette commands
    editor.addAction({
      id: 'toggle-minimap',
      label: 'Toggle Minimap',
      run: () => {
        const currentOptions = editor.getOptions();
        editor.updateOptions({
          minimap: { enabled: !currentOptions.get(monaco.editor.EditorOption.minimap).enabled }
        });
      }
    });

    editor.addAction({
      id: 'duplicate-line',
      label: 'Duplicate Line',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
      run: () => {
        editor.getAction('editor.action.copyLinesDownAction').run();
      }
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(parseInt(newSize));
  };

  const toggleWordWrap = () => {
    setWordWrap(wordWrap === 'off' ? 'on' : 'off');
  };

  const insertSnippet = (snippet) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits('insert-snippet', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: snippet
      }]);
      editor.focus();
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  // Code snippets for different languages
  const getSnippets = () => {
    switch (language) {
      case 'cpp':
        return [
          { label: 'For Loop', code: 'for (int i = 0; i < n; i++) {\n    \n}' },
          { label: 'While Loop', code: 'while (condition) {\n    \n}' },
          { label: 'If Statement', code: 'if (condition) {\n    \n}' },
          { label: 'Vector', code: 'vector<int> v;' },
          { label: 'Sort', code: 'sort(v.begin(), v.end());' },
        ];
      case 'java':
        return [
          { label: 'For Loop', code: 'for (int i = 0; i < n; i++) {\n    \n}' },
          { label: 'While Loop', code: 'while (condition) {\n    \n}' },
          { label: 'If Statement', code: 'if (condition) {\n    \n}' },
          { label: 'ArrayList', code: 'ArrayList<Integer> list = new ArrayList<>();' },
          { label: 'Scanner', code: 'Scanner sc = new Scanner(System.in);' },
        ];
      case 'python':
        return [
          { label: 'For Loop', code: 'for i in range(n):\n    ' },
          { label: 'While Loop', code: 'while condition:\n    ' },
          { label: 'If Statement', code: 'if condition:\n    ' },
          { label: 'List', code: 'lst = []' },
          { label: 'Dictionary', code: 'dict = {}' },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput('Error: Please write some code first!');
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
      const compilerUrl = `${import.meta.env.VITE_COMPILER_URL}/compiler/run`;
      const { data } = await axios.post(compilerUrl, payload);
      setOutput(data.output || 'No output');
      // Toast notification removed
    } catch (error) {
      console.error('Execution error:', error);
      if (error.response?.data?.error) {
        setOutput(`Error: ${error.response.data.error}`);
      } else {
        setOutput('Execution failed. Please check your code and try again.');
      }
      // Toast notification removed
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[60px] sm:h-[50px]">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white mr-8">Online Judge</h1>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/problems')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Problems
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Leaderboard
                </button>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome,{" "}
                <Link
                  to={`/profile/${localStorage.getItem('loggedInUser')}`}
                  className="text-blue-400 hover:text-blue-300 transition duration-200 font-medium cursor-pointer"
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

            {/* Mobile Hamburger Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 py-4">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/problems');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Problems
                </button>
                <button
                  onClick={() => {
                    navigate('/leaderboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Leaderboard
                </button>
                
                {/* Mobile User Info */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="text-gray-300 text-sm px-3 py-2">
                    Welcome,{" "}
                    <Link
                      to={`/profile/${localStorage.getItem('loggedInUser')}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-blue-400 hover:text-blue-300 transition duration-200 font-medium"
                    >
                      {localStorage.getItem('loggedInUser')}
                    </Link>
                    !
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200 mt-2 mx-3"
                    style={{ width: 'calc(100% - 1.5rem)' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
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

            {/* Editor Settings */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="text-sm text-gray-300">Theme:</label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="text-sm text-gray-300">Font Size:</label>
                <select
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Code Editor Section */}
        <div className="flex-1 flex flex-col min-h-0 lg:border-r border-gray-700 relative">
          {/* Left border - hidden on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gray-800 z-10 hidden lg:block"></div>
          
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Source Code
              </h3>
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
                <span>Lines: {code.split('\n').length}</span>
                <span>Characters: {code.length}</span>
                <span>Ctrl+Enter to run</span>
              </div>
            </div>
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1" style={{ minHeight: '300px' }}>
            <Editor
              height="100%"
              language={getMonacoLanguage()}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                fontSize: fontSize,
                wordWrap: wordWrap,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                bracketPairColorization: { enabled: true },
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                renderWhitespace: 'boundary',
                renderIndentGuides: true,
                folding: true,
                foldingStrategy: 'indentation',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
                smoothScrolling: true,
                lineNumbers: 'on',
                glyphMargin: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                roundedSelection: false,
                contextmenu: false,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                },
              }}
            />
          </div>
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex items-center justify-between flex-shrink-0">
          </div>
        </div>

        {/* Input/Output Section */}
        <div className="w-full lg:w-96 flex flex-col lg:flex-col min-h-0 lg:border-l bg-gray-800 border-gray-700 border-t lg:border-t-0">
          {/* Input Section */}
          <div className="flex-1 flex flex-col min-h-0 p-3" style={{ minHeight: '150px' }}>
            <div className="mb-1">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Input
              </h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program here..."
              className="w-full flex-1 p-3 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono text-sm resize-none border border-gray-700 rounded"
              spellCheck="false"
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col min-h-0 p-3 border-t border-gray-700" style={{ minHeight: '150px' }}>
            <div className="mb-1">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Output
              </h3>
            </div>
            <div className="w-full flex-1 p-3 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm overflow-auto whitespace-pre-wrap min-h-[120px]">
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
  );
}

export default Compiler;