import mongoose from 'mongoose';
import Problem from './Models/Problem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URL;
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Function to add sample problems
const addSampleProblems = async () => {
    try {
        // Read the sample problems JSON file
        const sampleProblemsPath = path.join(__dirname, '..', 'sample-problems.json');
        const sampleProblemsData = fs.readFileSync(sampleProblemsPath, 'utf8');
        const sampleProblems = JSON.parse(sampleProblemsData);

        console.log(`Found ${sampleProblems.length} sample problems to add...`);

        // Check if problems already exist and add new ones
        let addedCount = 0;
        let skippedCount = 0;

        for (const problemData of sampleProblems) {
            try {
                // Check if problem already exists
                const existingProblem = await Problem.findOne({ title: problemData.title });
                
                if (existingProblem) {
                    console.log(`Problem "${problemData.title}" already exists, skipping...`);
                    skippedCount++;
                    continue;
                }

                // Create new problem
                const newProblem = new Problem(problemData);
                await newProblem.save();
                
                console.log(`✅ Added problem: "${problemData.title}" (${problemData.difficulty})`);
                addedCount++;
            } catch (error) {
                console.error(`❌ Failed to add problem "${problemData.title}":`, error.message);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Added: ${addedCount} problems`);
        console.log(`   Skipped: ${skippedCount} problems`);
        console.log(`   Total in database: ${await Problem.countDocuments()}`);

    } catch (error) {
        console.error('Error adding sample problems:', error);
    }
};

// Function to clear all problems (use with caution!)
const clearAllProblems = async () => {
    try {
        const result = await Problem.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} problems from database`);
    } catch (error) {
        console.error('Error clearing problems:', error);
    }
};

// Main function
const main = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    
    if (args.includes('--clear')) {
        console.log('⚠️  Clearing all problems from database...');
        await clearAllProblems();
    }
    
    if (args.includes('--add') || args.length === 0) {
        console.log('➕ Adding sample problems...');
        await addSampleProblems();
    }

    if (args.includes('--list')) {
        console.log('📝 Listing all problems in database:');
        const problems = await Problem.find({}).select('title difficulty tags');
        problems.forEach((problem, index) => {
            console.log(`${index + 1}. ${problem.title} (${problem.difficulty}) - Tags: ${problem.tags.join(', ')}`);
        });
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
};

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node addSampleProblems.js [options]

Options:
  --add     Add sample problems to database (default)
  --clear   Clear all problems from database
  --list    List all problems in database
  --help    Show this help message

Examples:
  node addSampleProblems.js                 # Add sample problems
  node addSampleProblems.js --add           # Add sample problems
  node addSampleProblems.js --clear --add   # Clear all, then add sample problems
  node addSampleProblems.js --list          # List all problems
`);
    process.exit(0);
}

main().catch(console.error);
