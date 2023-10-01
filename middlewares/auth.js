const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async(req, res, next) => {
    try{
        //Extract Token
        const token = req.cookies.token 
                        || req.body.token
                        || req.header("Authorisation").replace("Bearer ", "");

        //If token missing, then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }catch(err){
            //verifiaction  - issue
            return res.status(401).json({
                success:false,
                message:"token is missing",
            });
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });

    }
}


//isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for students only",
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User Role cannot be verified'
        });
    }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor only",
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User Role cannot be verified'
        });
    }
}


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only",
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User Role cannot be verified'
        });
    }
}