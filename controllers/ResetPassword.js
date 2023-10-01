const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


//Reset password token
exports.resetPasswordToken = async (req, res) => {
    try{
        //get email from req body
        const email = req.body.email;
        //check user for this email, email validation
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered with us",
            });
        }
        //generate token
        const token = crypto.randomUUID();
        //Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                        {email:email},
                                        {
                                            token:token,
                                            resetPasswordExpires:Date.now() + 5*60*1000,
                                        },
                                        {new:true}); //updated will show
        //create Url
        const url = `http://localhost:3000/update-password/${token}`;
        //send mail containing the url
        await mailSender(email,
                        "Password Reset Link",
                        `Password Reset Link: ${url}`);
        //return response
        return res.json({
            success:true,
            message:"Email send succesfully please check email and change password ",
        });

    }catch(error){
        console.log("Error occur in sending mail : ", error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending password mail",
        });

    }

}

//resetPassword

exports.resetPassword = async (req,res) => {
    try{
        //data fetch
        const {password, confirmPassword, token } = req.body;
        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password doesn't matching",
            });
        }
        //get userdetails from db using token
        const userDetails = await User.findOne({token: token});
        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }
        //token time check
        if( userDetails.resetPasswordExpires < Date.now()  ){
            return res.json({
                success:false,
                messgae:"Token is expired , Please regenerate your token ",
            });

        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //password update
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        );
        //return response
        return res.status(200).json({
            success:true,
            message:"Password reset succesful",
        });

    }catch(error){
        console.log("Error occur in update the password: ", error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while updating the password",
        });

    }
}