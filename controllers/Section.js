const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        //return response
        return res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		});
    }catch(error){
        return res.status(500).json({
			success: false,
			message: "Unable to create a section, Please try again",
			error: error.message,
		});
    }
}


//Update Section
exports.updateSection = async(req, res) => {
    try{

        //data input
        const {sectionName, sectionId} =req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, 
            {sectionName},
            {new:true});
        //return response
        return res.status(200).json({
			success: true,
			message: "Section Updated Succesfully",
		});


    }catch(error){
        return res.status(500).json({
			success: false,
			message: "Unable to Update a section, Please try again",
			error: error.message,
		});
    }
}

//delete Section

exports.deleteSection = async (req, res) => {
    try{
        //get ID --asumming that we are sending ID in parms
        const {sectionId} = req.params;

        //use find by id and delete
        await Section.findByIdAndDelete(sectionId);
        //TODO[Testing]: do we nees to delete the entry from the course schema??
        //return response
        return res.status(200).json({
			success: false,
			message: "Section Deleted succesfully",
		});

    }
    catch(error){
        return res.status(500).json({
			success: false,
			message: "Unable to delete a section, Please try again",
			error: error.message,
		});

    }
}