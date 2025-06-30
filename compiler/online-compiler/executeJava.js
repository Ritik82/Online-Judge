const { exec, spawn } = require("child_process");
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

const executeJava = (filepath, inputData = '') => {
    const jobId = path.basename(filepath).split(".")[0];
    const outDir = outputPath;
    const mainJavaPath = path.join(outDir, "Main.java");

    return new Promise((resolve, reject) => {
        try {
            // Read the original file content
            const javaCode = fs.readFileSync(filepath, 'utf8');
            
            // Write the code to Main.java file
            fs.writeFileSync(mainJavaPath, javaCode);
            
            // Compile Java file
            exec(`javac "${mainJavaPath}" -d "${outDir}"`, (compileError, compileStdout, compileStderr) => {
                if (compileError) {
                    // Clean up files on compilation error
                    if (fs.existsSync(mainJavaPath)) {
                        fs.unlinkSync(mainJavaPath);
                    }
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                    }
                    reject(`Compilation Error: ${compileStderr}`);
                    return;
                }

                // Execute Java program using spawn
                const child = spawn('java', ['Main'], {
                    cwd: outDir,
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
                    // Clean up files
                    const filesToCleanup = [
                        mainJavaPath,
                        path.join(outDir, "Main.class"),
                        filepath
                    ];
                    filesToCleanup.forEach(file => {
                        if (fs.existsSync(file)) {
                            try {
                                fs.unlinkSync(file);
                            } catch (cleanupError) {
                                console.warn(`Failed to cleanup ${file}:`, cleanupError.message);
                            }
                        }
                    });

                    if (code !== 0) {
                        reject(`Runtime Error: Process exited with code ${code}\n${errorOutput}`);
                        return;
                    }

                    if (errorOutput.trim()) {
                        reject(`Runtime Error: ${errorOutput}`);
                        return;
                    }

                    resolve(output);
                });

                // Handle process errors
                child.on('error', (error) => {
                    // Clean up files
                    const filesToCleanup = [
                        mainJavaPath,
                        path.join(outDir, "Main.class"),
                        filepath
                    ];
                    filesToCleanup.forEach(file => {
                        if (fs.existsSync(file)) {
                            try {
                                fs.unlinkSync(file);
                            } catch (cleanupError) {
                                console.warn(`Failed to cleanup ${file}:`, cleanupError.message);
                            }
                        }
                    });

                    reject(`Runtime Error: ${error.message}`);
                });
            });
        } catch (fileError) {
            reject(`File Error: ${fileError.message}`);
        }
    });
};

module.exports = {
    executeJava,
};