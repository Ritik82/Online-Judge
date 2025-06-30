const express = require('express');
const router = express.Router();
const { generateFile } = require('../generateFile.js');
const { executeCpp } = require('../executeCpp.js');
const { executeJava } = require('../executeJava.js');
const { executePython } = require('../executePython.js');

router.post("/run", async (req, res) => {
    const { language = 'cpp', code, input = '' } = req.body;

    if (!code || code.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            error: "Code is required!" 
        });
    }

    try {
        // Generate file based on language
        let filePath;
        let output;

        switch (language) {
            case 'cpp':
                filePath = generateFile('cpp', code);
                output = await executeCpp(filePath, input);
                break;
            
            case 'java':
                filePath = generateFile('java', code);
                output = await executeJava(filePath, input);
                break;
            
            case 'python':
                filePath = generateFile('py', code);
                output = await executePython(filePath, input);
                break;
            
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unsupported language: ${language}`
                });
        }

        res.json({ 
            success: true,
            language,
            output: output.trim(),
            filePath 
        });

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ 
            success: false,
            error: typeof error === 'string' ? error : error.message || 'Execution failed'
        });
    }
});
module.exports = router;