const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
const inputPath = path.join(__dirname, "inputs");

// Create directories if they don't exist
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}
if (!fs.existsSync(inputPath)) {
    fs.mkdirSync(inputPath, { recursive: true });
}

const executeCpp = (filepath, inputData = '') => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    const inputFilePath = path.join(inputPath, `${jobId}_input.txt`);

    return new Promise((resolve, reject) => {
        // Compile C++ file with additional flags for better compatibility
        const compileCommand = `g++ -std=c++17 -O2 -Wall -Wextra -DONLINE_JUDGE "${filepath}" -o "${outPath}"`;
        
        exec(compileCommand, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                // Clean up source file on compilation error
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
                reject(`Compilation Error: ${compileStderr}`);
                return;
            }

            // Prepare execution command
            let executeCommand;
            
            if (inputData && inputData.trim()) {
                // Write input to file and use redirection
                try {
                    fs.writeFileSync(inputFilePath, inputData, 'utf8');
                    executeCommand = `"${outPath}" < "${inputFilePath}"`;
                } catch (writeError) {
                    // Clean up on write error
                    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
                    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                    reject(`Input File Error: ${writeError.message}`);
                    return;
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
                // Clean up files regardless of outcome
                const filesToCleanup = [inputFilePath, outPath, filepath];
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
                        reject(`Runtime Error: ${execStderr || execError.message || `Process exited with code ${execError.code}`}`);
                    }
                    return;
                }

                if (execStderr && execStderr.trim()) {
                    reject(`Runtime Error: ${execStderr}`);
                    return;
                }

                resolve(execStdout || '');
            });
        });
    });
};

module.exports = {
    executeCpp,
};