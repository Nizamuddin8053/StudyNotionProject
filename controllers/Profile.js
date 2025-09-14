const Profile = require ("../models/Profile");
const User = require ("../models/User");

exports.updateProfile = async (req , res)=>{
    try{
        // get data

        const {dateOfBirth="", about="",contactNumber,gender}= req.body;

        // get user id

        const id = req.user.id;

        // validation

        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            });

        }

        // find profile

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        // return response

        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails
        });

    }catch(error){

        return res.status(500).json({
            success:false,
            message:"unable to update user profile, due to some reason",
        });

    }
}

// delete account Handler

exports.deleteAccount = async (req,res)=>{
    try{
        // get id 

        const id = req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found",

            });
        }
        // delete user proFile 

        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // TODO: unenroll user from all enrolled courses
        
        // delete user

        await User.findByIdAndDelete({_id:id});

        // return response

        return res.status(200).json({
            success:true,
            message:"account successfully deleted"
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:"unable to delete account"
        })

    }
}

// HW: How I can schedule a delete request
// Lets user want to delete his account 
// user click on delete account but we will
// delete it after 10 days or 1 month

// HW: explore---> what is chron job



// get all users handler

exports.getAllUserDetails = async (req,res)=>{
    try{
        // get user id
        const id = req.user.id; 
        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        // return response

        return res.status(200).json({
            success:true,
            message:"user data fetched successfully"
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:"unable to fetch all data"
        })

    }
}