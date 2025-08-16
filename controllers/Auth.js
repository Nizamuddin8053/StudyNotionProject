const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// send otp

exports.sendOTP = async (req,res)=>{
    try{

        // fetch email 
        const email = req.body;

        // check already present ?
        const userPresent = await User.findOne({email});

        if(userPresent){
            return res.status(401).json({
                success:false,
                message: "user already registered"
            })
        }

        // else generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // check generated otp is unique or not---> iF not unique then store 
        // otp in db

        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            result = await OTP.findOne({ otp: otp });
        }

        // create payload for otp

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);

        res.status(200).json({
            success:true,
            message:"otp sent successfully",
            otp,
        })

        

    }catch(error){
        res.status(500).json({
            success:false,
            message: error.message,
        })

    }
    
}

// signUp

exports.signUp = async (req,res)=>{


    try{


        // step1---> fetch data from req body

        const { firstName, lastName, email, contactNumber, password, confirmPassword, accountType, otp } = req.body;

        // step2---> validate data

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "all fields are required"
            });
        }

        // step3--> match both passwords

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password and confirmPassword value does not match"
            })
        }

        // step4--> check user already exist or not

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "user already registered"
            })
        }


        // step5--> find most recent otp stored for the user
        // what is mean of it ? sort({createdAt:-1}).limit(1)

        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        // step6--> validate otp

        if (recentOtp.length == 0) {

            return res.status(400).json({
                success: false,
                message: "otp not found"
            });

        } else if (otp !== recentOtp.otp) {

            return res.status(400).json({
                success: false,
                message: "invalid otp"
            });
        }


        // step7--> Hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        // step8--> create entry in db

        const profileDetails = {
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}` // this url will give me Nizam khan ---> NK
        })




        // step9--> return result

        return res.status(200).json({
            success:true,
            message:"user is registered successfully",
            user
        })



    }catch(error){
        console.log(error);

        return res.status(500).json({
            success:false,
            message:"user can't be registered , please try again"
        })

    }
    

}


// login

exports.login = async (req,res)=>{

    try{

        // fetch data from req body

        const {email,password} = req.body;

        // validate data

        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "all fields required"
            })
        }

        // check user exist or not

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success: false,
                message: "user is not registered, please signup first"
            });
        }

        // generate JWT after password matching

        if(await bcrypt.compare(password,user.password)){

            const payload = {
                email: user.email,
                id: user._id,
                role: user.accountType
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn: "2h"
            });

            user.token = token;
            user.password = undefined;

            // create cookie and send response

            const options = {
                expires: new Date(Date.now()+3*24*60*60*1000),
                httpOnly: true
            };

            res.cookie("token",token, options).status(200).json({
                success: true,
                token,
                user,
                message: "logged in successfully"
            })
        }else{
            return res.status(401).json({
                success: false,
                message: "password is incorrect"
            })
        }

    }catch(error){

        console.log(error);
        return res.status(500).json({
            success: false,
            message: "login failure, please try again"
        })

    }
}

// change password

exports.changePassword = async (req,res)=>{

    // get data from req body


    // get old , new , confirm password


    // validate password


    // update password in db


    // send mail--- password updated


    // return response 

}