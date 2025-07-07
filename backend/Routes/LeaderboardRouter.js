import { Router } from 'express';
import { 
    getLeaderboard, 
    getUserRank, 
    getLeaderboardStats,
    refreshLeaderboard 
} from '../Controllers/LeaderboardController.js';

const router = Router();

// Get leaderboard with pagination and search (supports refresh parameter)
router.get('/', getLeaderboard);

// Get user's rank and nearby users (supports refresh parameter)
router.get('/rank/:username', getUserRank);

// Get leaderboard statistics (supports refresh parameter)
router.get('/stats', getLeaderboardStats);

// Force refresh all leaderboard data
router.post('/refresh', refreshLeaderboard);

export default router;
