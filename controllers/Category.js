const Category = require("../models/Category");

// create tag handler
exports.createCategory = async (req , res)=>{
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
        const categoryDetails = await Category.create({
            name:name,
            description:description
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message:"category created successfully"
        });



    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
    
}

// get all tags handler(like most popular course, similar course)

exports.showAllCategory = async (req,res)=>{

    try{
        // make sure name and description present in data
        const allCategory = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"all tags returned successfully",
            allCategory
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }

}

// category page details

exports.categoryPageDetails = async (req,res)=>{
    try{
        // get categories
        const {categoryId} = req.body;
        // get courses for specific categoryId
        const selectedCategory = await Category.findById(categoryId)
                .populate("courses")
                .exec();
        // validation

        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"data not found"
            })
        }
        // get coursefor different categories
        const differentCategories = await Category.find({
            _id:{$ne:categoryId}, // ne --> not equal to
        }).populate("courses")
        .exec();
        // get top selling courses
        // HW

        // return response

        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories
            },
        });
 
    }catch(error){

        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })

    }
}


