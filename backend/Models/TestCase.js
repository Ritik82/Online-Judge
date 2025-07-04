import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    default: 2000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 512 // MB
  }
}, { timestamps: true });

export default mongoose.model('TestCase', testCaseSchema);
