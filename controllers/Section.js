const Section = require("../models/Section");
const Course = require("../models/Course");

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
        // update course with section object id
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

    }catch(error){
        
    }
}