import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        
        // Check if token exists in Authorization header
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        } else {
            // Check if token exists in cookies
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token",
            success: false
        });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                success: false
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Middleware to check if user is authenticated (for regular users)
const isAuthenticated = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        req.userRole = user.role;
        next();
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export { verifyToken, isAdmin, isAuthenticated };
