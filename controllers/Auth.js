const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();



//sendOTP

exports.sendOTP = async(req, res) => {

    try{
        //fetch email from req body
        const {email} = req.body;

        //check if user alreay exist
        const checkUserPresent = await User.findOne({email});

        //if user alreay exits , then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User Already Registered",
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generate: ", otp);

        //check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};
        
        //create a entry for Otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return res success
        res.status(200).json({
            success:true,
            message:"OTP send succesfullty ",
            otp,
        })
        }catch(error){
            console.log("Message occur in otp genrating: ", error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })

        }

    
}

//-----------------------------------------------------

//signup
exports.signUp = async (req, res) => {

    try{
        //data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        //validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }



        //2 password match 
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm Password doesn't match, please try again"
            });
        }



        //check user already exits or not
        //Db Call
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            });
        }
        
        
        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("Recent Otp: ", recentOtp);

        //validate OTP
        if(recentOtp.length == 0){
            //Otp not found
            return res.status(400).json({
                success:false,
                message:"Otp not found",
            });
        }else if(otp !== recentOtp.otp){
            //Invalid otp
            return res.status(400).json({
                success:false,
                message:"OTP not matched",
            });
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);



        //entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //retur res 
        return res.status(200).json({
            success:true,
            message:"User Registered succesfully",
            user,
        });

    }catch(error){
        console.log("Error occur in: ",error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        });

    }
    
}

//-----------------------------------------------------
//Login
exports.login = async (req,res) => {
    try{
        //Get data from req body
        const {email, password}= req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required ,Please try again",
            });
        }

        //user check exit or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is Not registered , Please SignUp First",
            });
        }

        //generate JWT, after pawword matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",

            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in Succesfully",
            })


        }
        else{
            return res.status(400).json({
                success:false,
                message:"Password is Incorrect",
            });
        }
        

    }catch(error){
        console.log("Error occur in login: ", error);
        return res.status(500).json({
            success:false,
            message:"Login failure, please try again",
        });

    }
}

//-----------------------------------------------------

//ChangePassword
exports.changePassword = async(req,res) => {
    //get  data from req body
    //get oldPassword, newPassword, confirmNewPassword
    //Validation


    //Update Pwd in Db
    //Send mail - password updated
    //return response
}
