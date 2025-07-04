const { executeCppNoCleanup } = require('./executeCpp');
const { executeJavaNoCleanup } = require('./executeJava');
const { executePythonNoCleanup } = require('./executePython');
const { generateFile } = require('../online-compiler/generateFile');

/**
 * Judge a submission against a set of test cases
 * 
 * @param {string} language - Programming language (cpp, java, python)
 * @param {string} code - Source code
 * @param {Array} testCases - Array of test case objects with input and expectedOutput
 * @returns {Object} - Results of judgement with status and details
 */
const judgeSubmission = async (language, code, testCases) => {
  // First, generate the source file
  const filePath = generateFile(
    language === 'cpp' ? 'cpp' : 
    language === 'java' ? 'java' : 'py', 
    code
  );
  
  // Track results for all test cases
  const results = [];
  let overallStatus = 'Accepted';
  
  try {
    // Execute each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const testCaseNumber = i + 1;
      
      try {
        // Choose executor based on language
        let output;
        const startTime = Date.now();
        
        if (language === 'cpp') {
          output = await executeCppNoCleanup(filePath, testCase.input);
        } else if (language === 'java') {
          output = await executeJavaNoCleanup(filePath, testCase.input);
        } else if (language === 'python') {
          output = await executePythonNoCleanup(filePath, testCase.input);
        }
        
        const executionTime = Date.now() - startTime;
        
        // Normalize outputs for comparison (trim whitespace, normalize line endings)
        const normalizedOutput = output.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = testCase.expectedOutput.trim().replace(/\r\n/g, '\n');
        
        // Compare output with expected output
        if (normalizedOutput === normalizedExpected) {
          results.push({
            testCaseNumber,
            status: 'Accepted',
            executionTime,
            input: testCase.isHidden ? '[Hidden]' : testCase.input,
            expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
            actualOutput: testCase.isHidden ? '[Hidden]' : normalizedOutput
          });
        } else {
          overallStatus = 'Wrong Answer';
          results.push({
            testCaseNumber,
            status: 'Wrong Answer',
            executionTime,
            input: testCase.isHidden ? '[Hidden]' : testCase.input,
            expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
            actualOutput: testCase.isHidden ? '[Hidden]' : normalizedOutput
          });
        }
      } catch (error) {
        overallStatus = error.includes('time limit') ? 'Time Limit Exceeded' : 'Runtime Error';
        results.push({
          testCaseNumber,
          status: error.includes('time limit') ? 'Time Limit Exceeded' : 'Runtime Error',
          error: testCase.isHidden ? 'Error in hidden test case' : error,
          input: testCase.isHidden ? '[Hidden]' : testCase.input
        });
      }
    }
  } finally {
    // Clean up the source file after all test cases are completed
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn(`Failed to cleanup ${filePath}:`, cleanupError.message);
      }
    }
  }
  
  return {
    overallStatus,
    results
  };
};

module.exports = {
  judgeSubmission
};
