import UserModel from '../Models/User.js';
import Submission from '../Models/Submission.js';
import Problem from '../Models/Problem.js';

// Get user profile information
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find user by name (assuming username is stored in name field)
        const user = await UserModel.findOne({ name: username }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get submission statistics
        const totalSubmissions = await Submission.countDocuments({ username });
        const acceptedSubmissions = await Submission.countDocuments({ 
            username, 
            'status.success': true 
        });

        // Get unique problems solved
        const uniqueProblemTitles = await Submission.distinct('title', { 
            username, 
            'status.success': true 
        });

        // Get detailed information about solved problems
        const solvedProblemsDetails = await Problem.find({ 
            title: { $in: uniqueProblemTitles } 
        }).select('title difficulty codingScore tags');

        // Calculate acceptance rate
        const acceptanceRate = totalSubmissions > 0 ? 
            Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        // Get difficulty distribution of solved problems
        const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
        let totalScore = 0;

        for (const problem of solvedProblemsDetails) {
            const difficulty = problem.difficulty || 'Easy';
            difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
            totalScore += problem.codingScore || 100; // Default to 100 if no coding score
        }

        const profileData = {
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                joinDate: user.createdAt,
                solvedProblems: solvedProblemsDetails // Use actual solved problems with details
            },
            stats: {
                totalSubmissions,
                acceptedSubmissions,
                uniqueProblemsSolved: uniqueProblemTitles.length,
                acceptanceRate,
                totalScore,
                difficultyStats
            }
        };

        res.status(200).json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's submission history
export const getUserSubmissions = async (req, res) => {
    try {
        const { username } = req.params;
        const { page = 1, limit = 20, status, language } = req.query;
        
        // Build query filters
        let query = { username };
        
        if (status) {
            if (status === 'accepted') {
                query['status.success'] = true;
            } else if (status === 'wrong') {
                query['status.success'] = false;
            }
        }
        
        if (language) {
            query.lang = language;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get submissions with pagination and populate problem data
        const submissions = await Submission.find(query)
            .populate('problemId', 'difficulty codingScore tags')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const totalSubmissions = await Submission.countDocuments(query);
        const totalPages = Math.ceil(totalSubmissions / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                submissions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalSubmissions,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
