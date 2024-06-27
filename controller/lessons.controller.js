const lessonModel = require("../models/lessons.model");
const mongoose = require("mongoose");
exports.getLessons = (req, res) => {
  lessonModel.find().then((result) => {
    return res.status(200).json({
      message: "Lessons retrieved successfully!",
      lessons: result,
    });
  });
};

exports.createLesson = async (req, res) => {
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

    // Create a new lesson
    const lesson = new lessonModel({
      title,
      description,
      videoUrl,
      course,
      isPublished,
      isFree,
      duration,
      madeBy: req.user.id,
    });

    // Save the lesson to the database
    const result = await lesson.save();
    return res.status(201).json({
      message: "Lesson created successfully!",
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
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.updateLesson = async (req, res) => {
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
    const lesson = await lessonModel.findById(req.params.id);
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
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
exports.deleteLesson = async (req, res) => {
  try {
    // Find the lesson by id
    const lesson = await lessonModel.findById(req.params.id);
    // Delete the lesson
    await lesson.remove();
    return res.status(200).json({
      message: "Lesson deleted successfully!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
exports.getLessonById = async (req, res) => {
  try {
    // Find the lesson by id
    const lesson = await lessonModel.findById(req.params.id);
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
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
exports.getLessonsByCourse = async (req, res) => {
  try {
    // Find the lessons by course id
    const lessons = await lessonModel.find({ course: req.params.courseId });
    return res.status(200).json({
      message: "Lessons retrieved successfully!",
      lessons: lessons,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
exports.getPublishedLessons = async (req, res) => {
  try {
    // Find the published lessons
    const lessons = await lessonModel.find({ isPublished: true });
    return res.status(200).json({
      message: "Published lessons retrieved successfully!",
      lessons: lessons,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};