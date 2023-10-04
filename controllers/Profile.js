const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req, res) => {
    try{
        //Get data
        const {dateOfBirth="", about="", contactNumber,  gender} = req.body;
        // get UserID
        const id = req.user.id ;
        //Validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //Find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);


        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        
        // return response
        return res.status(200).json({
            success:true,
            message:'Profile updated succesfully',
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            //message:'Error occurs in update a profile',
            error:error.message,
        });
    }
};

//Delete account function

exports.deleteAccount = async (req, res) => {
    try{
        //get id 
        const id = req.user.id;
        //check validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //TODO: HW unenroll user from all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:'Profile deleted succesfully',
        });
    }catch(error){

    }
}