import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProblemSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  codingScore: {
    type: Number,
    default: 100,
  },
  tags: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  inputFormat: {
    type: String,
    default: "Standard input format",
  },
  outputFormat: {
    type: String,
    default: "Standard output format",
  },
  constraints: {
    type: String,
    default: "Standard constraints",
  },
  sampleInput: {
    type: String,
    default: "",
  },
  sampleOutput: {
    type: String,
    default: "",
  },
  testCases: {
    type: [{
      input: String,
      output: String,
    }],
    default: [],
  },
  hiddenTestcases: {
    type: [{
      input: String,
      output: String,
    }],
    default: [],
  },
  explanation: {
    type: String,
  },
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

const Problem = mongoose.model("Problem", ProblemSchema);

export default Problem;
