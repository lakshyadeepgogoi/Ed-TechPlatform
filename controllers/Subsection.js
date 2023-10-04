const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Create Sub Section
exports.createSubSection = async(req,res) => {
    try{

        //data fetch from req body
        const {sectionId, title, timeDuration, description} = req.body;
        //extact file/videos
        const video = req.files.videoFile;
        //Validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //Upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create a sub section
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //Update section with this sub section ObjectID
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                            {$push:{
                                subSection:SubSectionDetails._id,
                            }},
                            {new:true})
                            .populate("subSection");
        
        //return resonse
        return res.status(200).json({
            success:true,
            message:'Sub-Section Created succesfully',
            updatedSection,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        });

    };
    //HW    <=----=====        
//updateSubSection => handler function

// exports.updateSubSection = async (req, res) => {
//     try {
//       const { sectionId, subSectionId, title, description } = req.body
//       const subSection = await SubSection.findById(subSectionId)
  
//       if (!subSection) {
//         return res.status(404).json({
//           success: false,
//           message: "SubSection not found",
//         })
//       }
  
//       if (title !== undefined) {
//         subSection.title = title
//       }
  
//       if (description !== undefined) {
//         subSection.description = description
//       }
//       if (req.files && req.files.videoFile !== undefined) {
//         const video = req.files.videoFile;
//         const uploadDetails = await uploadImageToCloudinary(
//           video,
//           process.env.FOLDER_NAME
//         )
//         subSection.videoUrl = uploadDetails.secure_url
//         subSection.timeDuration = `${uploadDetails.duration}`
//       }
  
//       await subSection.save()

//       const updatedSection = await Section.findById(sectionId).populate("subSection")
  
//       return res.json({
//         success: true,
//         data:updatedSection,
//         message: "Section updated successfully",
//       })
//     } catch (error) {
//       console.error(error)
//       return res.status(500).json({
//         success: false,
//         message: "An error occurred while updating the section",
//       })
//     }
//   }
  
  //deleteSubSection => handler function
// exports.deleteSubSection = async (req, res) => {
//     try {
//       const { subSectionId, sectionId } = req.body
//       await Section.findByIdAndUpdate(
//         { _id: sectionId },
//         {
//           $pull: {
//             subSection: subSectionId,
//           },
//         }
//       )
//       const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
//       if (!subSection) {
//         return res
//           .status(404)
//           .json({ success: false, message: "SubSection not found" })
//       }

//       const updatedSection = await Section.findById(sectionId).populate("subSection")
  
//       return res.json({
//         success: true,
//         data: updatedSection,
//         message: "SubSection deleted successfully",
//       })
//     } catch (error) {
//       console.error(error)
//       return res.status(500).json({
//         success: false,
//         message: "An error occurred while deleting the SubSection",
//       })
//     }
//   }

}