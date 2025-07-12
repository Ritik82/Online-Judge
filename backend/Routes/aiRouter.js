import express from 'express';
import {
  aiCodeReviewWithPrompt,
  generateHints,
  generateCodeFeedback,
  generateExplanation,
  simplifyProblem
} from '../Controllers/aiController.js';

const router = express.Router();


router.post('/ai-review', async (req, res) => {
    const { prompt } = req.body;
    try{
        const result = await aiCodeReviewWithPrompt(prompt);
        res.json({ result });
    } catch (error) {
        console.error("Error occurred during AI code review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/hints', async (req, res) => {
    const { problem } = req.body;
    try {
        const hints = await generateHints(problem);
        res.json({ hints });
    } catch (error) {
        console.error("Error generating hints:", error);
        res.status(500).json({ error: "Failed to generate hints" });
    }
});

router.post('/feedback', async (req, res) => {
    const { problem, code, language } = req.body;
    try {
        const feedback = await generateCodeFeedback(problem, code, language);
        res.json({ feedback });
    } catch (error) {
        console.error("Error generating feedback:", error);
        res.status(500).json({ error: "Failed to generate feedback" });
    }
});

router.post('/explanation', async (req, res) => {
    const { problem } = req.body;
    try {
        const explanation = await generateExplanation(problem);
        res.json({ explanation });
    } catch (error) {
        console.error("Error generating explanation:", error);
        res.status(500).json({ error: "Failed to generate explanation" });
    }
});

router.post('/simplify', async (req, res) => {
    const { problem } = req.body;
    try {
        const simplified = await simplifyProblem(problem);
        res.json({ simplified });
    } catch (error) {
        console.error("Error simplifying problem:", error);
        res.status(500).json({ error: "Failed to simplify problem" });
    }
});

export default router;