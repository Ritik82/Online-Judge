import { Router } from 'express';
import { 
    getAdminDashboard, 
    getAllUsers, 
    updateUserRole, 
    deleteUser 
} from '../Controllers/AdminController.js';
import { verifyToken, isAdmin } from '../Middlewares/AdminMiddleware.js';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(isAdmin);

// Get admin dashboard data
router.get('/dashboard', getAdminDashboard);

// Get all users
router.get('/users', getAllUsers);

// Update user role
router.put('/users/role', updateUserRole);

// Delete user
router.delete('/users/:userId', deleteUser);

export default router;
