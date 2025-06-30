import UserModel from "../Models/User.js";

// Get admin dashboard data
const getAdminDashboard = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await UserModel.countDocuments({ role: 'user' });
        const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
        
        // Get recent users (last 10)
        const recentUsers = await UserModel.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            message: "Admin dashboard data retrieved successfully",
            success: true,
            data: {
                totalUsers,
                totalAdmins,
                recentUsers,
                totalActiveUsers: totalUsers + totalAdmins
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find()
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Users retrieved successfully",
            success: true,
            users
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Must be 'user' or 'admin'",
                success: false
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "User role updated successfully",
            success: true,
            user
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export { getAdminDashboard, getAllUsers, updateUserRole, deleteUser };
