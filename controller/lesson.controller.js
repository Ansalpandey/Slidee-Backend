import { Lesson } from "../models/lesson.model.js";
import { uploadVideoOnCloudinary } from "../utils/cloudinary.util.js";
import { Course } from "../models/course.model.js";

/**
 * Retrieves all lessons.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved lessons.
 */
const getLessons = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    await Lesson.find()
      .populate("course")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .then((result) => {
        return res.status(200).json(result);
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Creates a new lesson.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the lesson is created.
 * @throws {Error} - If there is an error creating the lesson.
 */
const createLesson = async (req, res) => {
  const { title, description, course, isPublished, isFree, duration, madeBy } =
    req.body;

  try {
    // Validate input
    if (
      !title ||
      !course ||
      !madeBy ||
      typeof isPublished === "undefined" ||
      typeof isFree === "undefined" ||
      !duration ||
      !description
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Check if the course exists
    const existingCourse = await Course.findById(course);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if video file is present
    if (!req.files || !req.files.videoUrl || req.files.videoUrl.length === 0) {
      return res.status(400).json({ message: "Video file must be provided" });
    }

    const video = req.files.videoUrl[0];

    // Upload video to cloudinary
    const videoUrl = await uploadVideoOnCloudinary(video.path);

    if (!videoUrl) {
      return res.status(500).json({ message: "Failed to upload video" });
    }

    // Create a new lesson
    const lesson = new Lesson({
      title,
      description,
      videoUrl,
      course,
      isPublished,
      isFree,
      duration,
      madeBy,
    });

    // Save the lesson to the database
    const savedLesson = await lesson.save();

    // Update the course to include the new lesson
    existingCourse.lessons.push(savedLesson._id);
    await existingCourse.save();

    // Populate the course with lessons
    const updatedCourse = await Course.findById(course).populate("lessons");

    return res.status(201).json({
      message: "Lesson created successfully!",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

/**
 * Update a lesson.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The title of the lesson.
 * @param {string} req.body.description - The description of the lesson.
 * @param {string} req.body.videoUrl - The URL of the lesson video.
 * @param {string} req.body.course - The course of the lesson.
 * @param {boolean} req.body.isPublished - Indicates if the lesson is published.
 * @param {boolean} req.body.isFree - Indicates if the lesson is free.
 * @param {number} req.body.duration - The duration of the lesson in minutes.
 * @param {Object} res - The response object.
 * @returns {Object} The updated lesson object.
 * @throws {Error} If there is an error updating the lesson.
 */
/**
 * Update a lesson.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The title of the lesson.
 * @param {string} req.body.description - The description of the lesson.
 * @param {string} req.body.videoUrl - The URL of the lesson video.
 * @param {string} req.body.course - The course of the lesson.
 * @param {boolean} req.body.isPublished - Indicates if the lesson is published.
 * @param {boolean} req.body.isFree - Indicates if the lesson is free.
 * @param {number} req.body.duration - The duration of the lesson in minutes.
 * @param {Object} res - The response object.
 * @returns {Object} The updated lesson object.
 * @throws {Error} If there is an error updating the lesson.
 */
const updateLesson = async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    course,
    isPublished,
    isFree,
    duration,
  } = req.body;

  try {
    // Validate input
    if (
      (!title || !description || !videoUrl,
      !course,
      !isPublished,
      !isFree,
      !duration)
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the lesson by id
    const lesson = await Lesson.findById(req.params.id);
    // Update the lesson
    lesson.title = title;
    lesson.description = description;
    lesson.videoUrl = videoUrl;
    lesson.course = course;
    lesson.isPublished = isPublished;
    lesson.isFree = isFree;
    lesson.duration = duration;
    // Save the lesson to the database
    const result = await lesson.save();
    return res.status(200).json({
      message: "Lesson updated successfully!",
      lesson: {
        id: result.id,
        title: result.title,
        description: result.description,
        videoUrl: result.videoUrl,
        course: result.course,
        isPublished: result.isPublished,
        isFree: result.isFree,
        duration: result.duration,
      },
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
/**
 * Deletes a lesson by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message or an error message.
 */
const deleteLesson = async (req, res) => {
  try {
    // Find the lesson by id
    const lesson = await Lesson.findById(req.params.id);
    // Delete the lesson
    await lesson.remove();
    return res.status(200).json({
      message: "Lesson deleted successfully!",
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
/**
 * Get a lesson by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved lesson.
 * @throws {Error} If there is a server error.
 */
const getLessonById = async (req, res) => {
  try {
    // Find the lesson by id
    const lesson = await Lesson.findById(req.params.id);
    return res.status(200).json({
      message: "Lesson retrieved successfully!",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        course: lesson.course,
        isPublished: lesson.isPublished,
        isFree: lesson.isFree,
        duration: lesson.duration,
      },
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
/**
 * Retrieves lessons by course ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved lessons.
 * @throws {Error} If there is a server error.
 */
const getLessonsByCourse = async (req, res) => {
  try {
    // Find the lessons by course id
    const lessons = await Lesson.find({ course: req.params.courseId });
    return res.status(200).json({
      message: "Lessons retrieved successfully!",
      lessons: lessons,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
/**
 * Retrieves the published lessons.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the published lessons.
 */
const getPublishedLessons = async (req, res) => {
  try {
    // Find the published lessons
    const lessons = await Lesson.find({ isPublished: true });
    return res.status(200).json({
      message: "Published lessons retrieved successfully!",
      lessons: lessons,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

export {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getLessonsByCourse,
  getPublishedLessons,
};
