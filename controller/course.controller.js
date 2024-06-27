const courseModel = require("../models/course.model");
const mongoose = require("mongoose");

exports.getCourses = (req, res) => {
  courseModel
    .find()
    .populate("lessons")
    .then((result) => {
      return res.status(200).json({
        message: "Courses retrieved successfully!",
        courses: result,
      });
    })
    .catch((error) => {
      console.error("Error retrieving courses:", error);
      return res.status(500).json({ message: "Server error" });
    });
};

exports.createCourse = async (req, res) => {
  const { name, description, fee, rating, madeBy } = req.body;

  try {
    // Validate input
    if (!name || !description || !fee || !rating || !madeBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the course already exists
    let course = await courseModel.findOne({ name });
    if (course) {
      return res.status(400).json({ message: "Course already exists" });
    }

    // Create a new course instance
    course = new courseModel({
      name,
      description,
      fee,
      rating,
      madeBy: new mongoose.Types.ObjectId(madeBy),
    });

    // Save the course to the database
    const result = await course.save();

    return res.status(201).json({
      message: "Course created successfully!",
      course: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { name, description, fee, rating } = req.body;

  try {
    // Validate input
    if (!name || !description || !fee || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the course exists
    let course = await courseModel.findByIdAndUpdate({ _id: req.params.id });
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

exports.findCourse = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the course exists
    let course = await courseModel.findOne({ name });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course found", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the course exists
    let course = await courseModel.findOne({ name });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the course exists
    let course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course found", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
