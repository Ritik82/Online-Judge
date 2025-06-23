import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
import AuthRouter from './Routes/AuthRouter.js'; // Ensure this file exists and contains your routes
import dotenv from 'dotenv';
dotenv.config();
import { DBConnection } from './Models/db.js'; // Ensure this file exists and connects to your database

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use the AuthRouter for authentication-related routes
app.use('/auth', AuthRouter);


DBConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});