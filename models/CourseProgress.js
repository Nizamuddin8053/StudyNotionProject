const mongoose = require("mongoose");
const { ref } = require("process");

// course progress

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    completedVideos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    }
});

exports.module = mongoose.model("CourseProgress", courseProgressSchema);