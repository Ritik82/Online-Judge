const express = require('express');
const router = express.Router();
const { judgeSubmission } = require('./judge');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables if not already loaded
if (!process.env.MONGODB_URL) {
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
}

// Mongoose connection - only connect if MONGODB_URL is provided
let MONGO_URI = process.env.MONGODB_URL;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("MongoDB connection established successfully");
    }).catch(err => console.error('Could not connect to MongoDB:', err));
} else {
    console.warn('Warning: MONGODB_URL not found in environment variables. Database operations will fail.');
}

// Create schemas locally rather than importing from backend to avoid module system conflicts
const ProblemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: String,
    testCases: Array,
    hiddenTestcases: Array
});

const TestCaseSchema = new mongoose.Schema({
    problemId: mongoose.Schema.Types.ObjectId,
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
    timeLimit: Number,
    memoryLimit: Number
});

const SubmissionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    success: {
      type: Boolean,
      required: true,
    },
    pass: {
      type: Number,
      required: true,
    },
    error: {
      type: String,
      required: false,
      default: '',
    },
  },
  lang: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  results: [{
    testCaseNumber: Number,
    status: String,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number,
    error: String
  }],
  totalTestCases: {
    type: Number,
    default: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create models
const Problem = mongoose.model('Problem', ProblemSchema);
const TestCase = mongoose.model('TestCase', TestCaseSchema);
const Submission = mongoose.model('Submission', SubmissionSchema);

// Endpoint to submit a solution for judging
router.post('/submit/:problemId', async (req, res) => {
    const { problemId } = req.params;
    const { language = 'cpp', code, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({
            success: false,
            error: "Invalid problem ID"
        });
    }

    if (!code || code.trim() === '') {
        return res.status(400).json({
            success: false,
            error: "Code is required!"
        });
    }

    try {
        // Fetch the problem and its test cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: "Problem not found"
            });
        }

        // Get test cases from the problem document itself
        const allTestCases = [
            ...(problem.testCases || []).map(tc => ({
                input: tc.input,
                expectedOutput: tc.output,
                isHidden: false
            })),
            ...(problem.hiddenTestcases || []).map(tc => ({
                input: tc.input,
                expectedOutput: tc.output,
                isHidden: true
            }))
        ];
        
        if (!allTestCases.length) {
            return res.status(404).json({
                success: false,
                error: "No test cases found for this problem"
            });
        }

        // Judge the submission
        const judgementResult = await judgeSubmission(language, code, allTestCases);

        // Determine if the submission was successful (all test cases passed)
        const testCasesPassed = judgementResult.results.filter(r => r.status === 'Accepted').length;
        const allTestsPassed = testCasesPassed === allTestCases.length;
        
        // Create submission with proper error message
        let errorMessage = '';
        if (!allTestsPassed) {
            const failedCount = allTestCases.length - testCasesPassed;
            errorMessage = `${failedCount} test case(s) failed`;
        }
        
        // Create a new submission record using exact backend model structure
        const submission = new Submission({
            username: userId || "anonymous",
            title: problem.title,
            problemId: problemId, // Add the problemId field for querying
            status: {
                success: allTestsPassed,
                pass: testCasesPassed,
                error: errorMessage
            },
            lang: language,
            code: code,
            results: judgementResult.results.map((result, index) => ({
                testCaseNumber: index + 1,
                status: result.status,
                input: result.input,
                expectedOutput: result.expectedOutput,
                actualOutput: result.actualOutput,
                executionTime: result.executionTime || 0,
                error: result.error || ''
            })),
            totalTestCases: allTestCases.length,
            testCasesPassed: testCasesPassed,
            timestamp: new Date()
        });

        await submission.save();

        res.json({
            success: true,
            submission: {
                id: submission._id,
                status: judgementResult.overallStatus,
                results: judgementResult.results.map(result => ({
                    ...result,
                    // Only include output details if not hidden
                    input: result.input,
                    expectedOutput: result.expectedOutput,
                    actualOutput: result.actualOutput
                })),
                testCasesPassed: judgementResult.results.filter(r => r.status === 'Accepted').length,
                totalTestCases: allTestCases.length
            }
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            error: typeof error === 'string' ? error : error.message || 'Submission failed'
        });
    }
});

// Endpoint to get a specific submission
router.get('/submission/:submissionId', async (req, res) => {
    const { submissionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        return res.status(400).json({
            success: false,
            error: "Invalid submission ID"
        });
    }

    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                error: "Submission not found"
            });
        }

        res.json({
            success: true,
            submission
        });

    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get submission'
        });
    }
});

// Endpoint to get all submissions for a problem
router.get('/submissions/:problemId', async (req, res) => {
    const { problemId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({
            success: false,
            error: "Invalid problem ID"
        });
    }

    try {
        let query = { problemId };
        
        // Add user filter if provided (note: we save as 'username' but query param is 'userId')
        if (userId) {
            query.username = userId; // Query by username field since that's what we save
        }

        const submissions = await Submission.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            submissions
        });

    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get submissions'
        });
    }
});

module.exports = router;
