const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create Subsection

exports.createSubSection = async (req , res)=>{
    try{
        // get data

        const {sectionId,title,timeDuration, description} = req.body;
        // extract Video From files

        const video = req.files.videoFile;
        // validation

        if(!sectionId || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                messge:"all fields are required"
            })
        }
        // upload video to cloudinary

        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create a subsection

        const subSection = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });
        // update section with this subsection id

        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:subSectionDetails._id,
                }
            },
            {new:true}

        );
        // HW: log updated section here,after adding populate query

        // return response

        return res.status(200).json({
            succcess:true,
            message:"sub section created successfully",
            updatedSection,

        })
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to create subsection, due to some reason"
        })

    }
}

// update subsection Handler

// delete subsection Handler