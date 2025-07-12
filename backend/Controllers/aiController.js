import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv with correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

const aiCodeReviewWithPrompt = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

const generateHints = async (problem) => {
    const prompt = `Give ONE helpful hint for solving this coding problem. Don't give multiple hints at once, just provide one progressive hint that guides the user in the right direction without revealing the complete solution.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Constraints: ${problem.constraints}
Sample Input: ${problem.sampleInput}
Sample Output: ${problem.sampleOutput}

Provide just ONE hint that helps the user think through the problem. Keep it concise and avoid using code blocks or complex formatting.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

const generateCodeFeedback = async (problem, code, language) => {
    const prompt = `Review this ${language} code and provide only constructive feedback on how to improve it. Do not provide any code or lengthy summaries, just focus on specific areas for improvement.

Problem: ${problem.title}
Code:
${code}

Focus your review on:
1. Logic issues and potential bugs
2. Efficiency improvements 
3. Code quality and readability issues
4. Better approaches or optimizations

Give concise, actionable feedback only. No code examples or long explanations.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

const generateExplanation = async (problem) => {
    const prompt = `The user has submitted code and is stuck. Explain the solution approach in simple terms without showing any code.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Sample Input: ${problem.sampleInput}
Sample Output: ${problem.sampleOutput}

Explain only:
1. The key insight needed to solve this problem
2. The general approach/algorithm 
3. Why this approach works

Keep it simple and conceptual. No code examples.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

const simplifyProblem = async (problem) => {
    const prompt = `Break down this problem into simple, easy-to-understand terms. Focus on the core concept.

Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}

Provide:
1. What the problem is asking in simple words
2. The main concept or pattern involved
3. A simple analogy or example if helpful
4. The key steps to think about

Make it beginner-friendly and clear.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

export { 
    aiCodeReviewWithPrompt,
    generateHints,
    generateCodeFeedback, 
    generateExplanation,
    simplifyProblem
};