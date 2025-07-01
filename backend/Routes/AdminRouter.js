import { Router } from 'express';
import { 
    getAdminDashboard, 
    getAllUsers, 
    updateUserRole, 
    deleteUser,
    createProblem,
    getAllProblems,
    updateProblem,
    deleteProblem
} from '../Controllers/AdminController.js';
import { verifyToken, isAdmin } from '../Middlewares/AdminMiddleware.js';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(isAdmin);

// Get admin dashboard data
router.get('/dashboard', getAdminDashboard);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Problem management routes
router.post('/problems', createProblem);
router.get('/problems', getAllProblems);
router.put('/problems/:problemId', updateProblem);
router.delete('/problems/:problemId', deleteProblem);

export default router;
