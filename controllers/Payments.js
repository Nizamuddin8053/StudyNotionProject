const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail templates/courseEnrollmentEmail");


// capture the payment and intiate the razorpay order

exports.capturePayment = async (req , res)=>{
    try{
        // get courseId and UserId
        const {course_Id} = req.body;
        const userId = req.user.id;
        // validation

        if(!course_Id){
            return res.json({
                success:false,
                message:"please provide valid course id"
            })
        }
        // valid courseId

        let course;
        try{

            course = await Course.findById(course_Id);
            if(!course){
                return res.json({
                    success:false,
                    message:"Could not find the course"
                });
            }

            // user already pay for the same course

            // convert user id(String) to object id

            const uid = new momgoose.Types.ObjectId(userId);
            if(!course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Student is already enrolled"
                });

            }

        }catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message
            });

        }
       
        // order create

        const amount = Course.price;
        const currency = "INR";
        const options = {
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now().toString()),
            notes:{
                courseId:course_Id,
                userId
            },

        }

        try{
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:PaymentResponse.id,
                currency:PaymentResponse.currency,
                amount:paymentResponse.amount
            });

        }catch(error){
            console.log(error);
            res.json({
                success:false,
                message:"could not initiate order"
            })

        }

        // return response

    }catch(error){

    }
}


// verify signature of razorpay and server

exports.verifySignature= async (req , res)=>{ // this req from razorpay not from frontend
    const webhookSecret = "12345678"; // server signature
    const signature = req.header("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest ){
        console.log("payment is authorized");

        // map course to user and user to course (using object id)

        // get course id and user id from notes (we put at the time of order creation in options)

        const {courseId,userId} = req.body.payload.payment.entity.notes;

        try{

            // fullfill the action

            // find the course and enroll student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"course not found"
                });
            }
            console.log(enrolledCourse);

            // find the student and add the course to their list enrolled courses me
            
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );

            console.log(enrolledStudent);

            // send mail for confirmation

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from Nizamuddin|StudyNotion",
                "Congratulations, you are onboarded into new course"

            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"signature verified and course added"
            })




        }catch(error){
            return res.status(500).json({
                success:false,
                message:error.message
            })

        }

    }else{
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }

}
