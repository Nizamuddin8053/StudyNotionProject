const Tag = require("../models/Tag");

// create tag handler
exports.createTag = async (req , res)=>{
    try{
        // fetch data
        const {name, description} = req.body;

        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds are required"
            })
        }

        // create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description
        });

        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message:"Tag created successfully"
        });



    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
    
}

// get all tags handler

exports.showAllTags = async (req,res)=>{

    try{
        // make sure name and description present in data
        const allTags = await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"all tags returned successfully",
            allTags
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }

}
