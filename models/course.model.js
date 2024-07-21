import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Course Schema
 * @typedef {Object} CourseSchema
 * @property {string} name - The name of the course.
 * @property {string} description - The description of the course.
 * @property {number} fee - The fee of the course.
 * @property {number} rating - The rating of the course.
 * @property {Array<string>} lessons - The array of lesson IDs associated with the course.
 * @property {string} madeBy - The ID of the user who created the course.
 * @property {Date} createdAt - The timestamp when the course was created.
 * @property {Date} updatedAt - The timestamp when the course was last updated.
 */
const courseSchema = new Schema(
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
    thumbnail: {
      type: String,
    },
    enrolledBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    rating: {
      type: Number,
      default: 0.0, // Default value
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    madeBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

courseSchema.virtual("enrolledCount").get(function () {
  return this.enrolledBy.length;
});

// Ensure virtual fields are serialized
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

const Course = mongoose.model("Course", courseSchema);
export { Course };
