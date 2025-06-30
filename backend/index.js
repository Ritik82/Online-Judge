import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from 'cors';
import AuthRouter from './Routes/AuthRouter.js';
import AdminRouter from './Routes/AdminRouter.js';
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
// Use the AuthRouter for authentication-related routes
app.use('/auth', AuthRouter);
// Use the AdminRouter for admin-related routes
app.use('/admin', AdminRouter);


await DBConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});