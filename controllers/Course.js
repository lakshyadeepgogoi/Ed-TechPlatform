const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");



//create Course handler functiion
exports.createCourse = async (req, res )=>{
    try{

        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, Category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !Category || !thumbnail){
            return res.this.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //check instructor or not
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor details ", instructorDetails);
        //TODO: verify that userid and instructorDetails._id are same or different?

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",

            });
        }


        //check given tag is valid or not
        const categoryDetails = await Tag.findById(Category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found",
            });
        }

        //upload image to cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            //tag:tagDetails._id,
            Category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });


        //add the new course to the user schema of the instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );

        //update the TAG schema
        //todo-HW

        //return response
        return res.status(200).json({
            success:true,
            message:"Courses created succesfully",
            data:newCourse,
        });






    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        })
    }
}




//getallCourse handler function

exports.showAllCourses = async (req,res ) => {
    try{
        //TODO: change the below statement incrementally
        const allCourses = await Course.find({});
        
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched succesfully",
            data:allCourses,
        });
        
        
                                                 
                
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        });
    }
}
