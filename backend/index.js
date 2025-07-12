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
import aiRouter from './Routes/aiRouter.js';
import dotenv from 'dotenv';
dotenv.config();
import { DBConnection } from './Models/db.js';

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', AuthRouter);

app.use('/admin', AdminRouter);

app.use('/problems', ProblemRouter);

app.use('/api', ProfileRouter);

app.use('/leaderboard', LeaderboardRouter);

app.use('/ai', aiRouter);
await DBConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});