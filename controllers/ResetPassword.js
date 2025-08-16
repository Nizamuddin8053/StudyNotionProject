const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");



// reset password token

exports.resetPasswordToken = async (req , res)=>{

    // 1.get email from req body
    // 2.check user for this email , email validation
    // 3.generate token
    // 4.update user by adding token and expiration time
    // 5.create url
    // 6.send mail containing url 
    // 7.return response


    try{

        // 1.get mail from req body

        const email = req.body.email;
        // 2.check user for this email , email validation
        const user = await User.findOne({ email:email });
        if(!user){
            return res.status(401).json({
                success: false,
                message: "You are not registered with us"
            })
        }

        // 3.generate token
        // use crypto UUID to generate random token and add 
        // this token to url 

        let token = crypto.randomUUID();

        // 4.update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                                           {email:email},
                                                           {
                                                            token:token,
                                                            resetPasswordExpires:Date.now()+5*60*1000
                                                           },
                                                           {new: true}
                                                        );


        // 5.create url
        const url = `http://localhost:3000/update-password/${token}`;

        // 6.send mail containing url 

        await mailSender(email,"Password reset link",
                         `password reset link: ${url}`
        )

        // 7.return response

        return res.status(200).json({
            success: true,
            message: "email sent successfully, please check your email "
        })


    }catch(error){
        res.status(500).json({
            success: false,
            message: "some error occured while reseting password"
        })
    }
}


// reset password

exports.resetPassword = async (req,res)=>{
    // 1.data fetch

    const {password, confirmPassword,token} = req.body;
    // 2.validation

    if(password !== confirmPassword){
        return res.json({
            success: false,
            message:"password not matching"
        });
    }
    // 3.get userdetails from db using token

    const userDetails = await User.findOne({token: token});

    if(!userDetails){
        return res.json({
            success:false,
            message:"token is invalid"
        })
    }
    // 4.token time check

    if(userDetails.resetPasswordExpires<Date.now()){
        return res.json({
            success: false,
            message:"token is expired,please regenerate your token"
        })
    }
    // 5.hash password

    const hashedPassword = await bcrypt.hash(password,10);
    // 6.update password

    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true}
    )
    // 7.return response

    return res.status(200).json({
        success:true,
        message:"password reset successfull"
    })
}