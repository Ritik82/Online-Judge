const { exec, spawn } = require("child_process");
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
    
    // Remove Windows file paths (C:\path\to\file)
    let cleaned = errorMessage.replace(/[A-Z]:[\\\/][^:\s]+[\\\/]/g, '');
    // Remove Unix file paths (/path/to/file/)
    cleaned = cleaned.replace(/\/[^\s:]+\//g, '');
    // Remove remaining path fragments
    cleaned = cleaned.replace(/[\\\/][^\s:]*Main_[a-f0-9]+[\\\/]/g, '');
    cleaned = cleaned.replace(/Main_[a-f0-9]+\.java:/g, 'Main.java:');
    cleaned = cleaned.replace(/Main_[a-f0-9]+/g, 'Main');
    
    return cleaned.trim();
};

// Execute Java for judging (no cleanup until all test cases complete)
const executeJavaJudge = (filepath, inputData = '') => {
    const jobId = path.basename(filepath).split(".")[0];
    // Remove hyphens and make it a valid Java identifier
    const cleanJobId = jobId.replace(/[-]/g, '');
    const outDir = outputPath;
    const mainJavaPath = path.join(outDir, `Main_${cleanJobId}.java`);
    const classPath = path.join(outDir, `Main_${cleanJobId}.class`);

    return new Promise((resolve, reject) => {
        try {
            // Read the original file content
            let javaCode = fs.readFileSync(filepath, 'utf8');
            
            // Replace the class name Main with Main_${cleanJobId} to avoid conflicts
            // Use a more precise regex to avoid breaking the class declaration
            javaCode = javaCode.replace(/public\s+class\s+Main\s*{/g, `public class Main_${cleanJobId} {`);
            
            // Verify that the replacement worked
            if (!javaCode.includes(`Main_${cleanJobId}`)) {
                reject('Failed to process Java class name. Ensure your class is named "Main".');
                return;
            }
            
            // Write the code to a unique Main.java file
            fs.writeFileSync(mainJavaPath, javaCode);
            
            // Compile Java file
            exec(`javac "${mainJavaPath}" -d "${outDir}"`, (compileError, compileStdout, compileStderr) => {
                if (compileError) {
                    // Clean up temp files on compilation error but not source
                    if (fs.existsSync(mainJavaPath)) {
                        fs.unlinkSync(mainJavaPath);
                    }
                    const errorMsg = compileStderr.trim() || compileError.message;
                    reject(cleanErrorMessage(errorMsg, 'Compilation'));
                    return;
                }

                // Execute Java program using spawn
                const child = spawn('java', [`Main_${cleanJobId}`], {
                    cwd: outDir,
                    timeout: 10000,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let output = '';
                let errorOutput = '';
                let timeoutHandle;

                // Set up timeout
                timeoutHandle = setTimeout(() => {
                    child.kill('SIGKILL');
                    reject('Time Limit Exceeded (10 seconds)');
                }, 10000);

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
                    // Clear timeout
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    
                    // Clean up temp files but NOT the source file
                    if (fs.existsSync(mainJavaPath)) {
                        try {
                            fs.unlinkSync(mainJavaPath);
                        } catch (cleanupError) {
                            console.warn(`Failed to cleanup ${mainJavaPath}:`, cleanupError.message);
                        }
                    }
                    if (fs.existsSync(classPath)) {
                        try {
                            fs.unlinkSync(classPath);
                        } catch (cleanupError) {
                            console.warn(`Failed to cleanup ${classPath}:`, cleanupError.message);
                        }
                    }

                    if (code !== 0) {
                        const errorMsg = errorOutput.trim() || `Process exited with code ${code}`;
                        reject(cleanErrorMessage(errorMsg, 'Runtime'));
                        return;
                    }

                    if (errorOutput.trim()) {
                        reject(cleanErrorMessage(errorOutput, 'Runtime'));
                        return;
                    }

                    resolve(output.trim());
                });

                // Handle process errors
                child.on('error', (error) => {
                    // Clear timeout
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    
                    // Clean up temp files but NOT the source file
                    if (fs.existsSync(mainJavaPath)) {
                        try { fs.unlinkSync(mainJavaPath); } catch (e) {}
                    }
                    if (fs.existsSync(classPath)) {
                        try { fs.unlinkSync(classPath); } catch (e) {}
                    }

                    reject(cleanErrorMessage(error.message, 'Runtime'));
                });
            });
        } catch (error) {
            reject(cleanErrorMessage(error.message, 'Runtime'));
        }
    });
};

module.exports = {
    executeJavaJudge,
};
