const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compRouter = require('./online-compiler/Routes/compRouter.js');

const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/compiler', compRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(` Compiler server is running on port ${PORT}`);
    console.log(` Supported languages: C++, Java, Python`);
});