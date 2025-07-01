import { Router } from 'express';
import { 
    getProblemsForUsers, 
    getProblemById, 
    getProblemsByDifficulty, 
    getProblemsByTag 
} from '../Controllers/ProblemController.js';
import { verifyToken, isAuthenticated } from '../Middlewares/AdminMiddleware.js';

const router = Router();

// All problem routes require authentication
router.use(verifyToken);
router.use(isAuthenticated);

// Get all problems for users
router.get('/', getProblemsForUsers);

// Get problem by ID
router.get('/:problemId', getProblemById);

// Get problems by difficulty
router.get('/difficulty/:difficulty', getProblemsByDifficulty);

// Get problems by tag
router.get('/tag/:tag', getProblemsByTag);

export default router;
