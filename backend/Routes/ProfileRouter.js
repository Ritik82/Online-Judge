import { Router } from 'express';
import { getUserProfile, getUserSubmissions, debugDatabaseContents } from '../Controllers/ProfileController.js';

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Profile routes working!' });
});

// Debug endpoint to check database contents
router.get('/debug/:username', debugDatabaseContents);

// Get user profile information
router.get('/profile/:username', getUserProfile);

// Get user's submission history
router.get('/submissions/:username', getUserSubmissions);

export default router;
