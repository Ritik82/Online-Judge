import UserModel from "../Models/User.js";
import Problem from "../Models/Problem.js";

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

// Create a new problem
const createProblem = async (req, res) => {
    try {
        const {
            title,
            difficulty,
            tags,
            description,
            inputFormat,
            outputFormat,
            sampleInput,
            sampleOutput,
            testCases,
            hiddenTestcases,
            explanation
        } = req.body;

        // Validation
        if (!title || !description || !difficulty) {
            return res.status(400).json({
                message: "Title, description, and difficulty are required",
                success: false
            });
        }

        // Check if problem already exists
        const existingProblem = await Problem.findOne({ title });
        if (existingProblem) {
            return res.status(400).json({
                message: "Problem with this title already exists",
                success: false
            });
        }

        const problem = await Problem.create({
            title,
            difficulty,
            codingScore: 100, // Default score
            tags: tags || [],
            description,
            inputFormat: inputFormat || "Standard input format",
            outputFormat: outputFormat || "Standard output format",
            constraints: "Standard constraints", // Default constraints
            sampleInput: sampleInput || "",
            sampleOutput: sampleOutput || "",
            testCases: testCases || [],
            hiddenTestcases: hiddenTestcases || [],
            explanation: explanation || ""
        });

        return res.status(201).json({
            message: "Problem created successfully",
            success: true,
            problem
        });
    } catch (err) {
        console.error('Error creating problem:', err);
        return res.status(500).json({
            message: "Internal server error: " + err.message,
            success: false
        });
    }
};

// Get all problems
const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Problems retrieved successfully",
            success: true,
            problems
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update a problem
const updateProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const updateData = req.body;

        const problem = await Problem.findByIdAndUpdate(
            problemId,
            updateData,
            { new: true }
        );

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Problem updated successfully",
            success: true,
            problem
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Delete a problem
const deleteProblem = async (req, res) => {
    try {
        const { problemId } = req.params;

        const problem = await Problem.findByIdAndDelete(problemId);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Problem deleted successfully",
            success: true
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export { getAdminDashboard, getAllUsers, updateUserRole, deleteUser, createProblem, getAllProblems, updateProblem, deleteProblem };
