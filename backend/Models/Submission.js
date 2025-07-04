import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for the problem
const SubmissionSchema = new Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
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
      required: false, // Make error field optional
      default: '', // Default to empty string
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

// Create a model based on the schema
const Submission = mongoose.model("Submission", SubmissionSchema);

export default Submission;