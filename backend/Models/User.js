import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define a schema for solved problems
// This schema will be used to store details of problems solved by the user
const solvedSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  codingScore: {
    type: Number,
    required: true,
  },
});
const UserSchema = new Schema({
    // User's first name - optional field with string type
    name: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from beginning and end
    },
    
    // User's email address - must be unique across all users
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Convert to lowercase before saving
        trim: true,
    },  
    
    // User's hashed password - will be encrypted before storage
    password: {
        type: String,
        required: true
    },
    
    // User's role - either 'user' or 'admin'
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    // Array of solved problems with their details
    solvedProblems: [solvedSchema],
    
    // Total coding score - calculated from solved problems
    totalCodingScore: {
        type: Number,
        default: 0
    },
    
    // Statistics for leaderboard
    stats: {
        totalSubmissions: {
            type: Number,
            default: 0
        },
        acceptedSubmissions: {
            type: Number,
            default: 0
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        rank: {
            type: Number,
            default: 0
        }
    }
}, {
    // Add timestamp fields for tracking when user was created/updated
    timestamps: true 
});

// Create and export the User model based on the schema
const UserModel = mongoose.model('users', UserSchema);
export default UserModel;