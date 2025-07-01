import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function EditProblemModal({ 
  isOpen, 
  onClose, 
  problem,
  onRefreshProblems 
}) {
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    testCases: '',
    hiddenTestcases: ''
  });

  useEffect(() => {
    if (problem) {
      const initialData = {
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'Easy',
        tags: problem.tags ? problem.tags.join(', ') : '',
        inputFormat: problem.inputFormat || '',
        outputFormat: problem.outputFormat || '',
        sampleInput: problem.sampleInput || '',
        sampleOutput: problem.sampleOutput || '',
        testCases: problem.testCases && problem.testCases.length > 0 ? JSON.stringify(problem.testCases, null, 2) : '',
        hiddenTestcases: problem.hiddenTestcases && problem.hiddenTestcases.length > 0 ? JSON.stringify(problem.hiddenTestcases, null, 2) : ''
      };
      setNewProblem(initialData);
    }
  }, [problem]);

  if (!isOpen) return null;
  
  if (!problem) {
    return null;
  }

  const handleClose = () => {
    onClose();
    setNewProblem({
      title: '',
      description: '',
      difficulty: 'Easy',
      tags: '',
      inputFormat: '',
      outputFormat: '',
      sampleInput: '',
      sampleOutput: '',
      testCases: '',
      hiddenTestcases: ''
    });
  };

  const updateProblem = async () => {
    // Validation
    if (!newProblem.title.trim()) {
      toast.error('Problem title is required');
      return;
    }

    if (!newProblem.description.trim()) {
      toast.error('Problem description is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const authUrl = import.meta.env.VITE_AUTH_URL;

      // Parse tags and test cases with better error handling
      let parsedTestCases = [];
      let parsedHiddenTestCases = [];

      // Parse test cases
      if (newProblem.testCases.trim()) {
        try {
          parsedTestCases = JSON.parse(newProblem.testCases);
          if (!Array.isArray(parsedTestCases)) {
            throw new Error('Test cases must be an array');
          }
          // Validate test case structure
          parsedTestCases.forEach((testCase, index) => {
            if (!testCase.input || !testCase.output) {
              throw new Error(`Test case ${index + 1} must have both 'input' and 'output' fields`);
            }
          });
        } catch (err) {
          toast.error(`Invalid test cases: ${err.message}`);
          return;
        }
      }

      // Parse hidden test cases
      if (newProblem.hiddenTestcases.trim()) {
        try {
          parsedHiddenTestCases = JSON.parse(newProblem.hiddenTestcases);
          if (!Array.isArray(parsedHiddenTestCases)) {
            throw new Error('Hidden test cases must be an array');
          }
          // Validate hidden test case structure
          parsedHiddenTestCases.forEach((testCase, index) => {
            if (!testCase.input || !testCase.output) {
              throw new Error(`Hidden test case ${index + 1} must have both 'input' and 'output' fields`);
            }
          });
        } catch (err) {
          toast.error(`Invalid hidden test cases: ${err.message}`);
          return;
        }
      }

      const problemData = {
        title: newProblem.title.trim(),
        description: newProblem.description.trim(),
        difficulty: newProblem.difficulty,
        tags: newProblem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        inputFormat: newProblem.inputFormat.trim() || "Standard input format",
        outputFormat: newProblem.outputFormat.trim() || "Standard output format",
        sampleInput: newProblem.sampleInput.trim(),
        sampleOutput: newProblem.sampleOutput.trim(),
        testCases: parsedTestCases,
        hiddenTestcases: parsedHiddenTestCases
      };

      const response = await axios.put(`${authUrl}/admin/problems/${problem._id}`, problemData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Problem updated successfully!');
      handleClose();

      // Refresh problems list
      onRefreshProblems();
    } catch (error) {
      console.error('Error updating problem:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update problem');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Problem: {problem.title}
            </h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Basic Information
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., Two Sum"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problem Description *
                </label>
                <textarea
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Provide a clear and detailed problem statement..."
                  rows="5"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Be specific about constraints and requirements</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Hard">🔴 Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newProblem.tags}
                    onChange={(e) => setNewProblem({ ...newProblem, tags: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Array, Hash Table, Math"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Input Format
                </label>
                <textarea
                  value={newProblem.inputFormat}
                  onChange={(e) => setNewProblem({ ...newProblem, inputFormat: e.target.value })}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Describe the input format..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Format
                </label>
                <textarea
                  value={newProblem.outputFormat}
                  onChange={(e) => setNewProblem({ ...newProblem, outputFormat: e.target.value })}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Describe the expected output format..."
                  rows="3"
                />
              </div>
            </div>

            {/* Right Column - Examples and Test Cases */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Examples & Test Cases
              </h4>

              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h5 className="text-md font-medium text-white mb-3">Sample Example</h5>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sample Input
                    </label>
                    <textarea
                      value={newProblem.sampleInput}
                      onChange={(e) => setNewProblem({ ...newProblem, sampleInput: e.target.value })}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none font-mono"
                      placeholder="2 7 11 15&#10;9"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sample Output
                    </label>
                    <textarea
                      value={newProblem.sampleOutput}
                      onChange={(e) => setNewProblem({ ...newProblem, sampleOutput: e.target.value })}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none font-mono"
                      placeholder="[0,1]"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h5 className="text-md font-medium text-white mb-3">Test Cases Configuration</h5>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Public Test Cases (JSON)
                    </label>
                    <textarea
                      value={newProblem.testCases}
                      onChange={(e) => setNewProblem({ ...newProblem, testCases: e.target.value })}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none font-mono"
                      placeholder='[{"input": "2 7 11 15\\n9", "output": "[0,1]"}]'
                      rows="4"
                    />
                    <p className="text-xs text-gray-400 mt-1">These will be visible to users</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hidden Test Cases (JSON)
                    </label>
                    <textarea
                      value={newProblem.hiddenTestcases}
                      onChange={(e) => setNewProblem({ ...newProblem, hiddenTestcases: e.target.value })}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none font-mono"
                      placeholder='[{"input": "3 2 4\\n6", "output": "[1,2]"}]'
                      rows="4"
                    />
                    <p className="text-xs text-gray-400 mt-1">These are used for final evaluation</p>
                  </div>
                </div>
              </div>

              {/* JSON Format Helper */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <h6 className="text-sm font-medium text-blue-300 mb-2">JSON Format Example:</h6>
                <code className="text-xs text-blue-200 block bg-blue-900/30 p-2 rounded">
                  {`[
  {
    "input": "line1\\nline2",
    "output": "expected_result"
  }
]`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-750 px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            onClick={updateProblem}
            disabled={!newProblem.title || !newProblem.description}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Update Problem
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProblemModal;
