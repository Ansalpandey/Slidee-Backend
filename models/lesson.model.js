import mongoose from "mongoose";

/**
 * Represents the lesson schema for the lessons collection.
 *
 * @typedef {Object} LessonSchema
 * @property {string} title - The title of the lesson.
 * @property {string} description - The description of the lesson.
 * @property {string} videoUrl - The URL of the lesson's video.
 * @property {mongoose.Schema.Types.ObjectId} course - The ID of the course that the lesson belongs to.
 * @property {boolean} isPublished - Indicates whether the lesson is published or not.
 * @property {boolean} isFree - Indicates whether the lesson is free or not.
 * @property {number} duration - The duration of the lesson in minutes.
 * @property {mongoose.Schema.Types.ObjectId} madeBy - The ID of the user who created the lesson.
 * @property {Date} createdAt - The timestamp when the lesson was created.
 * @property {Date} updatedAt - The timestamp when the lesson was last updated.
 */
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    videoUrl: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    madeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);
export { Lesson };
