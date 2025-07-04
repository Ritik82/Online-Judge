const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { exec } = require("child_process");

const outputPath = path.join(__dirname, "outputs");
const inputPath = path.join(__dirname, "inputs");

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
    let cleaned = errorMessage.replace(/\/.*?\//g, '');
    cleaned = cleaned.replace(/\\.*?\\/g, '');
    
    return cleaned;
};

// Execute C++ for judging (no cleanup until all test cases complete)
const executeCppJudge = (filepath, inputData = '') => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filepath)) {
            return reject("Source file not found");
        }

        const jobID = uuid();
        const inputFilePath = path.join(inputPath, `${jobID}.txt`);
        const outPath = path.join(outputPath, `${jobID}.exe`);

        // Write input data to file
        try {
            fs.writeFileSync(inputFilePath, inputData || '');
        } catch (error) {
            return reject(`Failed to write input file: ${error.message}`);
        }

        // Compile the C++ code
        const compileCommand = `g++ "${filepath}" -o "${outPath}"`;
        
        exec(compileCommand, {
            timeout: 15000,
            windowsHide: true
        }, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                // Clean up input file only
                if (fs.existsSync(inputFilePath)) {
                    try { fs.unlinkSync(inputFilePath); } catch (e) {}
                }
                
                return reject(cleanErrorMessage(compileStderr || compileError.message, 'Compile'));
            }

            // Execute the compiled program
            let executeCommand;
            if (inputData && inputData.trim()) {
                if (process.platform === 'win32') {
                    executeCommand = `"${outPath}" < "${inputFilePath}"`;
                } else {
                    executeCommand = `"${outPath}" < "${inputFilePath}"`;
                }
            } else {
                executeCommand = `"${outPath}"`;
            }

            // Execute with proper timeout and buffer settings
            exec(executeCommand, {
                timeout: 10000,
                maxBuffer: 1024 * 1024, // 1MB buffer
                killSignal: 'SIGTERM',
                windowsHide: true
            }, (execError, execStdout, execStderr) => {
                // Clean up temporary files but NOT the source file
                const filesToCleanup = [inputFilePath, outPath];
                filesToCleanup.forEach(file => {
                    if (fs.existsSync(file)) {
                        try {
                            fs.unlinkSync(file);
                        } catch (cleanupError) {
                            console.warn(`Failed to cleanup ${file}:`, cleanupError.message);
                        }
                    }
                });

                if (execError) {
                    if (execError.killed || execError.signal === 'SIGTERM') {
                        reject("Time Limit Exceeded");
                    } else if (execError.code === 3221225477 || execError.code === -1073741819) {
                        reject("Runtime Error: Access violation (possible infinite loop or memory issue)");
                    } else {
                        reject(cleanErrorMessage(execStderr || execError.message || `Process exited with code ${execError.code}`, 'Runtime'));
                    }
                    return;
                }

                if (execStderr && execStderr.trim()) {
                    reject(cleanErrorMessage(execStderr, 'Runtime'));
                    return;
                }

                resolve(execStdout || '');
            });
        });
    });
};

module.exports = {
    executeCppNoCleanup: executeCppJudge,
};
