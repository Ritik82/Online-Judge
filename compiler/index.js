const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// Configure dotenv before importing routes
dotenv.config({ path: path.resolve(__dirname, '.env') });

const compRouter = require('./online-compiler/Routes/compRouter.js');
const judgeRouter = require('./judge/judgeRouter.js');

const app = express();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Compiler service is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        supportedLanguages: ['cpp', 'java', 'python']
    });
});

app.use('/api/compiler', compRouter);
app.use('/api/judge', judgeRouter);
// Also add direct routes for easier access
app.use('/judge', judgeRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(` Compiler server is running on port ${PORT}`);
    console.log(` Supported languages: C++, Java, Python`);
});