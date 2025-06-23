import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const signup= async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if(!(name && email && password)){
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }
        const existingUser = await UserModel.findOne({email});
        if(existingUser){
            return res.status(409).json({ 
                message: "User already exists, please login",
                success:false 
            });
        }
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);
        // Create a new user instance
        const user = await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword
        });
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email 
            }, 
            process.env.SECRET_KEY, 
            {
                expiresIn: "24h",
            }
        );
        const userResponse = {
            name: user.name,
            email: user.email,
            id: user._id
        };
        // Return success response with token
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: userResponse,
            token: token
        });
    } catch(err){
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};
const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }
        const user= await UserModel.findOne({email});
        if(!user){
            return res.status(401).json({ 
                message: "Invalid email or password",
                success:false 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ 
                message: "Invalid email or password", 
                success:false 
            });
        }
        // Here you would typically generate a JWT token and send it back to the client
        const Token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email 
            },
            process.env.SECRET_KEY,
            { 
                expiresIn: '24h' 
            }
        )
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };
        const userResponse = {
            name: user.name,
            email: user.email,
            id: user._id
        };
        // Return success response with token
        return res.status(200)
            .cookie("token", Token, cookieOptions)
            .json({ 
            message: "Login successful", 
            success:true, 
            user: userResponse,
            token: Token
        });
    } catch(err){
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
            });
    }
};

export  { signup, login };
