import mongoose from 'mongoose';
const { Schema } = mongoose;

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
    }
}, {
    // Add timestamp fields for tracking when user was created/updated
    timestamps: true 
});

// Create and export the User model based on the schema
const UserModel = mongoose.model('users', UserSchema);
export default UserModel;