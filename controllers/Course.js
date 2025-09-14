const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const {uploadImageTOCloudinary} = require("../utils/imageUploader"); // another way to import


// create course

exports.createCourse = async(req,res)=>{
    try{

        // fetch data
        const {courseName, courseDescription, whatYouWillLearn , price , tag} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnail;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message:"all fields are required"
            })
        }

        // check for instructor

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        // TOdo: Verify that user.id and instructorDetails._id are same or difFerent

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }

        // check given tag is valid or not

        const tagDetails = await Tag.findById(tag);

        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "tag details not found"
            })
        }

        // upload image to cloudinary

        const thumbnailImage = await uploadImageTOCloudinary(thumbnail,process.env.Folder_Name);

        // create an entry for new course

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail: thumbnailImage.secure_url
        });

        // add new course to user schema of instructor

        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        )

        // update tag schema
        // ToDO homework

        // return response

        return res.status(200).json({
            success:true,
            message:"course created successfully",
            data:newCourse
        })




    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message
        })

    }
}


// fetch all course


exports.showAllCourse = async (req,res)=>{
    try{
        const allCourses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate("instructor").exec();


        return res.status(200).json({
            success:true,
            message:"data for all courses fetched successfully",
            data:allCourses
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error:error.message
        })
    }


}


// get all courses
exports.getCourseDetails = async (req , res)=>{
    try{
        // get course id

        const courseId = req.body;
        // find course details

        const courseDetails = await Course.find(
            {_id:courseId},
        ).populate( // populate every field where object id is passed
            {
                path:"instructor", // populate both instructor and profile data using additional details
                populate:{
                    path:"additionalDetails"
                }
            }
        ).populate("category")
        .populate("ratingAndReviews")
        .populate(
            {
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
            }
        );

        // validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message: `could not find the course with ${courseId}`
            })
        }

        // return response
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}