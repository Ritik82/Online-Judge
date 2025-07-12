import UserModel from "../Models/User.js";
import Submission from "../Models/Submission.js";
import Problem from "../Models/Problem.js";

// Helper function to calculate and update user stats
const calculateAndUpdateUserStats = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) return null;

        // Get all submissions for this user
        const allSubmissions = await Submission.find({ username: user.name });
        const acceptedSubmissions = allSubmissions.filter(sub => sub.status.success);
        
        // Get unique accepted problem titles
        const uniqueAcceptedProblems = [...new Set(acceptedSubmissions.map(sub => sub.title))];
        
        // Calculate total coding score from accepted problems
        let totalCodingScore = 0;
        const solvedProblems = [];
        
        for (const problemTitle of uniqueAcceptedProblems) {
            const problem = await Problem.findOne({ title: problemTitle });
            if (problem) {
                totalCodingScore += problem.codingScore || 100;
                solvedProblems.push({
                    title: problemTitle,
                    difficulty: problem.difficulty,
                    codingScore: problem.codingScore || 100
                });
            }
        }

        // Update user with calculated stats
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                totalCodingScore,
                solvedProblems,
                stats: {
                    totalSubmissions: allSubmissions.length,
                    acceptedSubmissions: acceptedSubmissions.length,
                    problemsSolved: uniqueAcceptedProblems.length,
                    rank: user.stats?.rank || 0 // Keep existing rank for now
                }
            },
            { new: true }
        );

        return updatedUser;
    } catch (error) {
        console.error('Error calculating user stats:', error);
        return null;
    }
};

// Helper function to recalculate and update all user rankings
const updateAllUserRankings = async () => {
    try {
        
        // Get all users sorted by ranking criteria
        const users = await UserModel.find({ role: 'user' })
            .sort({ 
                totalCodingScore: -1, 
                'stats.problemsSolved': -1,
                'stats.acceptedSubmissions': -1,
                name: 1 
            });

        // Update ranks
        const updatePromises = users.map((user, index) => {
            const newRank = index + 1;
            if (user.stats?.rank !== newRank) {
                return UserModel.findByIdAndUpdate(
                    user._id,
                    { 'stats.rank': newRank },
                    { new: true }
                );
            }
            return Promise.resolve(user);
        });

        await Promise.all(updatePromises);
        return users.length;
    } catch (error) {
        console.error('Error updating rankings:', error);
        throw error;
    }
};

// Get leaderboard data with real-time stats update
const getLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', refresh = false } = req.query;
        const skip = (page - 1) * limit;

        // Build search filter
        let searchFilter = { role: 'user' };
        if (search) {
            searchFilter.name = { $regex: search, $options: 'i' };
        }

        // If refresh is requested, update all user stats and rankings
        if (refresh === 'true') {
            
            // Get all users that match search filter
            const usersToUpdate = await UserModel.find(searchFilter);
            
            // Update stats for each user in parallel (limited batches to avoid overwhelming DB)
            const batchSize = 10;
            for (let i = 0; i < usersToUpdate.length; i += batchSize) {
                const batch = usersToUpdate.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(user => calculateAndUpdateUserStats(user._id))
                );
            }
            
            // Update all user rankings after stats are updated
            await updateAllUserRankings();
        }

        // Get users with updated stats (use pre-calculated data for performance)
        const users = await UserModel.find(searchFilter)
            .select('name email createdAt totalCodingScore stats solvedProblems')
            .sort({ 
                totalCodingScore: -1,
                'stats.problemsSolved': -1,
                'stats.acceptedSubmissions': -1,
                name: 1
            })
            .skip(skip)
            .limit(parseInt(limit));

        // Format response data
        const rankedUsers = users.map((user, index) => {
            const stats = user.stats || {};
            const acceptanceRate = stats.totalSubmissions > 0 ? 
                Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) : 0;

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                totalCodingScore: user.totalCodingScore || 0,
                totalSubmissions: stats.totalSubmissions || 0,
                acceptedSubmissions: stats.acceptedSubmissions || 0,
                problemsSolved: stats.problemsSolved || 0,
                acceptanceRate,
                rank: stats.rank || (skip + index + 1) // Use stored rank or calculate positional rank
            };
        });

        // Get total count for pagination
        const totalUsers = await UserModel.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            message: refresh === 'true' ? 
                "Leaderboard refreshed and retrieved successfully" : 
                "Leaderboard retrieved successfully",
            data: {
                users: rankedUsers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    hasNext: skip + limit < totalUsers,
                    hasPrev: page > 1
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get user's rank and nearby users with real-time update
const getUserRank = async (req, res) => {
    try {
        const { username } = req.params;
        const { refresh = false } = req.query;

        // Find the user
        const user = await UserModel.findOne({ name: username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // If refresh is requested, update this user's stats
        if (refresh === 'true') {
            await calculateAndUpdateUserStats(user._id);
            // Also update rankings to get accurate rank
            await updateAllUserRankings();
        }

        // Get all users sorted by ranking criteria (use pre-calculated data)
        const allUsers = await UserModel.find({ role: 'user' })
            .select('name totalCodingScore stats')
            .sort({ 
                totalCodingScore: -1,
                'stats.problemsSolved': -1,
                'stats.acceptedSubmissions': -1,
                name: 1
            });

        // Find user's current rank
        const userRank = allUsers.findIndex(u => u.name === username) + 1;

        // Get nearby users (5 above and 5 below)
        const startIndex = Math.max(0, userRank - 6);
        const endIndex = Math.min(allUsers.length, userRank + 5);
        const nearbyUsers = allUsers.slice(startIndex, endIndex).map((user, index) => ({
            name: user.name,
            totalCodingScore: user.totalCodingScore || 0,
            problemsSolved: user.stats?.problemsSolved || 0,
            rank: startIndex + index + 1
        }));

        // Get the updated user data
        const updatedUser = await UserModel.findOne({ name: username });

        res.status(200).json({
            success: true,
            message: refresh === 'true' ? 
                "User rank refreshed and retrieved successfully" : 
                "User rank retrieved successfully",
            data: {
                userRank,
                totalUsers: allUsers.length,
                nearbyUsers,
                userStats: {
                    name: updatedUser.name,
                    totalCodingScore: updatedUser.totalCodingScore || 0,
                    totalSubmissions: updatedUser.stats?.totalSubmissions || 0,
                    acceptedSubmissions: updatedUser.stats?.acceptedSubmissions || 0,
                    problemsSolved: updatedUser.stats?.problemsSolved || 0,
                    rank: updatedUser.stats?.rank || userRank
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('User rank error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get leaderboard statistics with real-time update
const getLeaderboardStats = async (req, res) => {
    try {
        const { refresh = false } = req.query;
        
        // If refresh is requested, update all user stats first
        if (refresh === 'true') {
            
            // Update all user stats
            const allUsers = await UserModel.find({ role: 'user' });
            const batchSize = 20;
            
            for (let i = 0; i < allUsers.length; i += batchSize) {
                const batch = allUsers.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(user => calculateAndUpdateUserStats(user._id))
                );
            }
            
            // Update rankings
            await updateAllUserRankings();
        }

        // Get basic counts
        const totalUsers = await UserModel.countDocuments({ role: 'user' });
        const totalProblems = await Problem.countDocuments();
        
        // Get aggregated stats from pre-calculated user data
        const statsAggregation = await UserModel.aggregate([
            {
                $match: { role: 'user' }
            },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: '$stats.totalSubmissions' },
                    totalAccepted: { $sum: '$stats.acceptedSubmissions' },
                    activeUsers: {
                        $sum: {
                            $cond: [{ $gt: ['$stats.totalSubmissions', 0] }, 1, 0]
                        }
                    },
                    avgCodingScore: { $avg: '$totalCodingScore' },
                    maxCodingScore: { $max: '$totalCodingScore' }
                }
            }
        ]);

        const stats = statsAggregation[0] || {
            totalSubmissions: 0,
            totalAccepted: 0,
            activeUsers: 0,
            avgCodingScore: 0,
            maxCodingScore: 0
        };

        res.status(200).json({
            success: true,
            message: refresh === 'true' ? 
                "Leaderboard statistics refreshed successfully" : 
                "Leaderboard statistics retrieved successfully",
            data: {
                totalUsers,
                totalProblems,
                totalSubmissions: stats.totalSubmissions || 0,
                totalAccepted: stats.totalAccepted || 0,
                activeUsers: stats.activeUsers || 0,
                averageCodingScore: Math.round(stats.avgCodingScore || 0),
                maxCodingScore: stats.maxCodingScore || 0,
                overallAcceptanceRate: stats.totalSubmissions > 0 ? 
                    Math.round((stats.totalAccepted / stats.totalSubmissions) * 100) : 0,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Leaderboard stats error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// New endpoint: Force refresh all user stats and rankings
const refreshLeaderboard = async (req, res) => {
    try {
        
        const allUsers = await UserModel.find({ role: 'user' });
        let updatedCount = 0;
        
        // Update all user stats in batches
        const batchSize = 15;
        for (let i = 0; i < allUsers.length; i += batchSize) {
            const batch = allUsers.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(user => calculateAndUpdateUserStats(user._id))
            );
            updatedCount += results.filter(result => result !== null).length;
        }
        
        // Update all rankings
        const totalRanked = await updateAllUserRankings();
        
        res.status(200).json({
            success: true,
            message: "Leaderboard force refreshed successfully",
            data: {
                usersUpdated: updatedCount,
                usersRanked: totalRanked,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Force refresh error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export { getLeaderboard, getUserRank, getLeaderboardStats, refreshLeaderboard, calculateAndUpdateUserStats, updateAllUserRankings };
