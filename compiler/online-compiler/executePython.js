const { spawn } = require("child_process");
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

const executePython = (filepath, inputData = '') => {
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
            // Clean up source file
            if (fs.existsSync(filepath)) {
                try {
                    fs.unlinkSync(filepath);
                } catch (cleanupError) {
                    console.warn(`Failed to cleanup ${filepath}:`, cleanupError.message);
                }
            }

            if (code !== 0) {
                reject(`Runtime Error: Process exited with code ${code}\n${errorOutput}`);
                return;
            }

            if (errorOutput.trim()) {
                reject(`Error: ${errorOutput}`);
                return;
            }

            resolve(output);
        });

        // Handle process errors
        child.on('error', (error) => {
            // Clean up source file
            if (fs.existsSync(filepath)) {
                try {
                    fs.unlinkSync(filepath);
                } catch (cleanupError) {
                    console.warn(`Failed to cleanup ${filepath}:`, cleanupError.message);
                }
            }

            reject(`Runtime Error: ${error.message}`);
        });
    });
};

module.exports = {
    executePython,
};