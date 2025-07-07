import { Router } from 'express';
import { getUserProfile, getUserSubmissions,} from '../Controllers/ProfileController.js';

const router = Router();

// Get user profile information
router.get('/profile/:username', getUserProfile);

// Get user's submission history
router.get('/submissions/:username', getUserSubmissions);

export default router;
