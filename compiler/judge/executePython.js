const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "..", "online-compiler", "outputs");
const inputPath = path.join(__dirname, "..", "online-compiler", "inputs");

// Create directories if they don't exist
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}
if (!fs.existsSync(inputPath)) {
    fs.mkdirSync(inputPath, { recursive: true });
}

const cleanErrorMessage = (errorMessage, type) => {
    // Simple error cleaner for judge execution
    if (!errorMessage) return "Unknown error";
    
    // Remove file paths from error messages
    let cleaned = errorMessage.replace(/File ".*?source\.py"/, 'File "source.py"');
    cleaned = cleaned.replace(/\/.*?\/source\.py/, 'source.py');
    cleaned = cleaned.replace(/\\.*?\\source\.py/, 'source.py');
    
    return cleaned;
};

// Execute Python for judging (no cleanup until all test cases complete)
const executePythonJudge = (filepath, inputData = '') => {
    return new Promise((resolve, reject) => {
        // Execute Python program using spawn
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const child = spawn(pythonCommand, [filepath], {
            timeout: 10000
        });

        let output = '';
        let errorOutput = '';

        // Handle stdout
        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Handle stderr
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // If there's input data, write it to stdin
        if (inputData && inputData.trim()) {
            child.stdin.write(inputData);
            child.stdin.end();
        } else {
            child.stdin.end();
        }

        // Handle process completion
        child.on('close', (code) => {
            // DON'T clean up source file - leave it for other test cases
            
            if (code !== 0) {
                reject(cleanErrorMessage(`Process exited with code ${code}\n${errorOutput}`, 'Runtime'));
                return;
            }

            if (errorOutput.trim()) {
                reject(cleanErrorMessage(errorOutput, 'Runtime'));
                return;
            }

            resolve(output);
        });

        // Handle process errors
        child.on('error', (error) => {
            // DON'T clean up source file - leave it for other test cases
            reject(cleanErrorMessage(error.message, 'Runtime'));
        });
    });
};

module.exports = {
    executePythonNoCleanup: executePythonJudge
};
