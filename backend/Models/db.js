import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const DBConnection = async () => {
    // Get MongoDB connection string from environment variables
    const MONGO_URI = process.env.MONGODB_URL;
    try {
        // Connect to MongoDB with recommended options
        await mongoose.connect(MONGO_URI, { 
            useNewUrlParser: true,
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error while connecting to the database:", error.message);
        process.exit(1); // Exit process if database connection fails
    }
};
// Export the connection function for use in other modules
export { DBConnection };
