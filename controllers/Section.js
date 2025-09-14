const Section = require("../models/Section");
const Course = require("../models/Course");
const { response } = require("express");

// create section
exports.createSection = async (req , res)=>{
    try{

        // fetch data
        const {sectionName, courseId} = req.body;
        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        // create section
        const newSection = await Section.create({sectionName});
        // update course with section object id(add section to course)
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {new:true}
        );
        //HW: use populate to replace section and subsection both in the updatedCourseDetails
        // return response

        return res.status(200).json({
            success:true,
            message:"Section created successfully"
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section,please try again"
        });

    }
    

}

// update section

exports.updateSection = async (req,res)=>{
    try{
        // data input

        const {sectionName,sectionId} = req.body;
        // data validation

        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            })
        }

        // update data

        const sectoin = await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new:true}
        );
        // return response

        return res.status(200).json({
            success:true,
            message:"Sectoin Updated Successfully"

        });

    }catch(error){

        return res.status(500).json({
            success: false,
            message: "Unable to update section,please try again"
        });
        
    }
}


// delete section

exports.deleteSection = async (req,res)=>{
    try{
        // get id(assume,we are passing id in parameters)

        const {sectionId} = req.params;

        // use findByIDAndDelete

        await Section.findByIdAndDelete(sectionId);

        // Todo: do we need to delete section id from course
        // return response

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })

    }catch(error){

        return res.status(500).json({
            success: false,
            message: "Unable to delete section,please try again"
        });


    }
}