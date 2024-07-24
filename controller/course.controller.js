import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  uploadBase64Image,
} from "../utils/cloudinary.util.js";

/**
 * Retrieves all courses from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved courses.
 */
const getCourses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const courses = await Course.find()
      .populate("lessons")
      .populate("madeBy", "name username")
      .populate("enrolledBy", "name, username") // Populate enrolledBy if needed
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      message: "Courses retrieved successfully",
      courses,
      totalPages: Math.ceil(totalCourses / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving courses:", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 * Create a new course.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The name of the course.
 * @param {string} req.body.description - The description of the course.
 * @param {number} req.body.fee - The fee of the course.
 * @param {number} req.body.rating - The rating of the course.
 * @param {string} req.body.madeBy - The ID of the user who created the course.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
/**
 * Create a new course.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The name of the course.
 * @param {string} req.body.description - The description of the course.
 * @param {number} req.body.fee - The fee of the course.
 * @param {number} req.body.rating - The rating of the course.
 * @param {string} req.body.madeBy - The ID of the user who created the course.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const createCourse = async (req, res) => {
  const { name, description, fee, rating, thumbnailBase64 } = req.body;

  try {
    // Validate input
    if (!name || !description || !fee || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the course already exists
    let course = await Course.findOne({ name });
    if (course) {
      return res.status(400).json({ message: "Course already exists" });
    }

    let thumbnail = { url: "" };

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);
    }

    // Upload the profile picture if it is provided
    if (thumbnailBase64) {
      thumbnail = await uploadBase64Image(thumbnailBase64);
    }

    // Extract user ID from the token
    const madeBy = req.user._id;

    // Create a new course instance
    course = new Course({
      name,
      description,
      fee,
      rating,
      thumbnail: thumbnail.url,
      madeBy: new mongoose.Types.ObjectId(madeBy),
    });

    // Save the course to the database
    const result = await course.save();

    // Update the user with the new course
    await User.findByIdAndUpdate(madeBy, {
      $push: { courses: result._id },
    });

    return res.status(201).json({
      message: "Course created successfully!",
      course: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update a course.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const updateCourse = async (req, res) => {
  const { name, description, fee, rating } = req.body;

  try {
    // Validate input
    if (!name || !description || !fee || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the course exists
    let course = await Course.findByIdAndUpdate({ _id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update the course
    course.name = name;
    course.description = description;
    course.fee = fee;
    course.rating = rating;

    // Save the updated course to the database
    const result = await course.save();

    return res.status(200).json({
      message: "Course updated successfully!",
      course: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Find a course by name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const findCourse = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the course exists
    let course = await Course.findOne({ name });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course found", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Deletes a course.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const deleteCourse = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the course exists
    let course = await Course.findOne({ name });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete the course
    await Course.findByIdAndDelete(course._id);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get a course by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the course exists
    let course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course found", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const bookmarkCourse = async (req, res) => {
  const userId = req.user._id;
  const courseId = req.params.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the course is already bookmarked
    if (user.bookmarkedCourses.includes(courseId)) {
      return res.status(400).json({ message: "Course is already bookmarked by the user" });
    }

    // Add course to bookmarked courses
    user.bookmarkedCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: "Course bookmarked successfully" });
  } catch (error) {
    console.error("Error bookmarking course:", error);
    res.status(500).json({ message: error.message });
  }
};


const enrollCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "User ID and Course ID are required" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    // Check if the user who made the course is trying to enroll
    if (course.madeBy.toString() === userId) {
      return res.status(400).json({
        message: "The user who created the course cannot enroll in it",
      });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "User is already enrolled in this course" });
    }

    user.enrolledCourses.push(courseId);
    course.enrolledBy.push(userId);

    await user.save();
    await course.save();

    return res
      .status(200)
      .json({ message: "User enrolled in course successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const unEnrollCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "User ID and Course ID are required" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    if (!user.enrolledCourses.some((id) => id.equals(courseId))) {
      return res
        .status(400)
        .json({ message: "User is not enrolled in this course" });
    }

    user.enrolledCourses = user.enrolledCourses.filter(
      (id) => !id.equals(courseId)
    );
    course.enrolledBy = course.enrolledBy.filter((id) => !id.equals(userId));

    await user.save();
    await course.save();

    return res
      .status(200)
      .json({ message: "User unenrolled from course successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  getCourses,
  createCourse,
  updateCourse,
  findCourse,
  deleteCourse,
  getCourseById,
  enrollCourse,
  unEnrollCourse,
  bookmarkCourse
};
