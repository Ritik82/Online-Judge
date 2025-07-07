import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from 'cors';
import AuthRouter from './Routes/AuthRouter.js';
import AdminRouter from './Routes/AdminRouter.js';
import ProblemRouter from './Routes/ProblemRouter.js';
import ProfileRouter from './Routes/ProfileRouter.js';
import LeaderboardRouter from './Routes/LeaderboardRouter.js';
import dotenv from 'dotenv';
dotenv.config();
import { DBConnection } from './Models/db.js';

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use('/auth', AuthRouter);

app.use('/admin', AdminRouter);

app.use('/problems', ProblemRouter);

app.use('/api', ProfileRouter);

app.use('/leaderboard', LeaderboardRouter);


await DBConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});