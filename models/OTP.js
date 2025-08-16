const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");


const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60
    }
});


// mail verification Function

async function sendVerificationEmail(email,otp){
    try{

        const mailResponse = await mailSender(email,"Verification mail from StudyNotion",otp);
        console.log("mail sent successfully",mailResponse);

    }catch(error){
        console.log("error occured while sending mails",error);
        throw error;
    }
    
}

// pre middleware before intracting with db
// doc comes in post middleware not in pre middleware

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);