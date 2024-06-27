const userModel = require("../models/user.model");
const courseModel = require("../models/course.model");
const uploadOnCloudinary = require("../utils/cloudinary.util");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getUsers = (req, res) => {
  userModel
    .find()
    .populate("courses")
    .then((result) => {
      return res.status(200).json({
        message: "Users retrieved successfully!",
        users: result,
      });
    })
    .catch((error) => {
      console.error("Error retrieving users:", error);
      return res.status(500).json({ message: "Server error" });
    });
};

exports.createUser = async (req, res) => {
  const { name, email, password, age, username } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !age || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload the profile picture and cover image
    const profilePicture = await uploadOnCloudinary(
      req.files?.profileImage[0]?.path
    );
    const coverImage = await uploadOnCloudinary(req.files?.coverImage[0]?.path);

    // Create a new user instance
    user = new userModel({
      name,
      email,
      age,
      username,
      password: hashedPassword,
      profileImage: profilePicture.url,
      coverImage: coverImage.url,
    });

    // Save the user to the database
    const result = await user.save();
    return res.status(201).json({
      message: "User created successfully!",
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        age: result.age,
        username: result.username,
        profileImage: result.profilePicture,
        coverImage: result.coverImage,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if the user exists
    let user = await userModel.findOne().or([{ email }, { username }]);
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Compare the password
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create a JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;

        // Set the token in a cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Adjust according to your needs
          maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        });

        return res.status(200).json({
          message: "Logged in successfully!",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
            username: user.username,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.getUserById = (req, res) => {
  userModel.findById(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User retrieved successfully!",
      user: result,
    });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  // Ensure the userId is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(userId)) {
    userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .then((result) => {
        if (result) {
          return res.status(200).json({
            message: "User updated successfully!",
            user: result,
          });
        } else {
          return res.status(404).json({
            message: "User not found!",
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Error updating user",
          error: err,
        });
      });
  } else {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

exports.forgetPassword = (req, res) => {
  const { email } = req.body;

  userModel.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create a JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;

        // Send the email with the reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
        return res.status(200).json({
          message: "Reset link sent to your email",
          resetLink,
        });
      }
    );
  });
};

exports.deleteUser = (req, res) => {
  userModel.findByIdAndDelete(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User deleted successfully!",
      user: result,
    });
  });
};

exports.getUserCourses = (req, res) => {
  courseModel
    .find({ user: req.params.id })
    .populate("courses")
    .then((result) => {
      return res.status(200).json({
        message: "Courses retrieved successfully!",
        courses: result,
      });
    });
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully!",
  });
};
