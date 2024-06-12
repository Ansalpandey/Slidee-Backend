const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [800, "Course description cannot exceed 800 characters"],
    },
    fee: {
      type: Number,
      required: [true, "Course fee is required"],
    },
    rating: {
      type: Number,
      default: 0.0, // Default value
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
