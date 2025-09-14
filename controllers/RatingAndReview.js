const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");


// create rating

exports.createRating = async (req , res)=>{
    try{
        // get user id

        const userId = req.user.id;
        // fetch rating and review
        const {rating,review,courseId} = req.body;
    
        // check if user is enrolled or not

        const courseDetails = await Course.findOne(
            {
                _id:courseId,
                studentsEnrolled:{$elemMatch:{$eq:userId}} // HW :read about equal and elementMatch
            },

        );

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }

        // check if user already reviewed or not 

        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId
        });

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"course is already reviewed by the user"
            })
        }
        // create rating and review

        const ratingReview = await RatingAndReview.create({
            rating,review,
            course:courseId,
            user:userId
        });
        // add this rating and review with course (update Course)

        await Course.findByIdAndUpdate({

            _id:courseId,
            $push:{
                RatingAndReview:ratingReview._id,
            },
            new:true

        });

        // return response

        return res.status(200).json({
            success:true,
            message:"Rating and review created successfully",
            ratingReview
        })

        

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}


// get average rating

exports.getAverageRating = async (req, res) => {
    try {

        // get course id

        const courseId = req.body.courseId;
        // calculate average rating

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId), // object id deprecated
                }
            },
            {
                $group:{
                    _id:null, // add all entries in single group
                    averageRating:{$avg:"$rating"}, // read documentation
                }
            }
        ]
        )
        // return avg rating

        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,

            })


        }

        // if no rating
        return res.status(200).json({
            success:true,
            message:"average rating is 0, no rating given till now",
            averageRating:0,
        })


        

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error occured while fetching rating"
        })

    }
}

// get all rating

exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
              .sort({rating:"desc"})
              .populate({  // populate user why? because object id passed
                path:"user",
                select:"firstName lastName email image",
              })
              .populate({
                path:"course",
                select:"courseName",
              })
              .exec();

        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews
        })       


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to fetch all rating right now"
        })

    }
}


