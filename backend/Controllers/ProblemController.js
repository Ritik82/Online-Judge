import Problem from "../Models/Problem.js";

// Get all problems for users (public access) with optional filtering
const getProblemsForUsers = async (req, res) => {
    try {
        const { difficulty, tags } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
            filter.difficulty = difficulty;
        }
        
        if (tags) {
            filter.tags = { $in: [tags] };
        }

        const problems = await Problem.find(filter)
            .select('-hiddenTestcases') // Don't send hidden test cases to users
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Problems retrieved successfully",
            success: true,
            problems
        });
    } catch (err) {
        console.error('Error in getProblemsForUsers:', err);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
};

// Get a single problem by ID
const getProblemById = async (req, res) => {
    try {
        const { problemId } = req.params;
        
        const problem = await Problem.findById(problemId)
            .select('-hiddenTestcases'); // Don't send hidden test cases to users

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Problem retrieved successfully",
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

// Filter problems by difficulty
const getProblemsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        
        if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
            return res.status(400).json({
                message: "Invalid difficulty level",
                success: false
            });
        }

        const problems = await Problem.find({ difficulty })
            .select('-hiddenTestcases')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: `${difficulty} problems retrieved successfully`,
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

// Filter problems by tags
const getProblemsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        
        const problems = await Problem.find({ tags: { $in: [tag] } })
            .select('-hiddenTestcases')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: `Problems with tag '${tag}' retrieved successfully`,
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

export { getProblemsForUsers, getProblemById, getProblemsByDifficulty, getProblemsByTag };
