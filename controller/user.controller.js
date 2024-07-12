import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  uploadOnCloudinary,
  uploadBase64Image,
} from "../utils/cloudinary.util.js";

/**
 * Retrieves all users from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved users.
 */
const getUsers = (req, res) => {
  User.find()
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

/**
 * Retrieves the profile of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the user's profile.
 */

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("courses");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile retrieved successfully!",
      user: user,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Creates a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the created user data.
 * @throws {Error} If there is an error during the user creation process.
 */
const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    username,
    bio,
    profileImageBase64,
    coverImageBase64,
  } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !age || !username || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Initialize profileImage and coverImage with default values
    let profileImage = { url: "" };
    let coverImage = { url: "" };

    // Upload the profile picture if it is provided
    if (profileImageBase64) {
      profileImage = await uploadBase64Image(profileImageBase64);
    }

    // Upload the cover image if it is provided
    if (coverImageBase64) {
      coverImage = await uploadBase64Image(coverImageBase64);
    }

    // Upload the profile picture if it is provided
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }

    // Upload the cover image if it is provided
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      age,
      username,
      bio,
      password,
      profileImage: profileImage.url,
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
        profileImage: result.profileImage,
        coverImage: result.coverImage,
        bio: result.bio,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

/**
 * Logs in a user by checking the provided credentials and generating a JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the logged-in user details and JWT token.
 * @throws {Error} If there is a server error.
 */
const loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne().or([{ email }, { username }]);
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create a JWT payload
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    };

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "User logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        username: user.username,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

/**
 * Updates a user by their ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The updated user object or an error message.
 */
const updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  // Ensure the userId is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(userId)) {
    User.findByIdAndUpdate(userId, updateData, { new: true })
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

/**
 * Handles the forget password functionality.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a reset link sent to the user's email.
 */
const forgetPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }).then((user) => {
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
      { expiresIn: "1d" },
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

/**
 * Deletes a user by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and the deleted user.
 */
const deleteUser = (req, res) => {
  User.findByIdAndDelete(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User deleted successfully!",
      user: result,
    });
  });
};

/**
 * Retrieves courses for a specific user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved courses.
 */
const getUserCourses = (req, res) => {
  Course.find({ user: req.params.id })
    .populate("courses")
    .then((result) => {
      return res.status(200).json({
        message: "Courses retrieved successfully!",
        courses: result,
      });
    });
};

/**
 * Logs out the user by clearing the token cookie.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message.
 */
const logoutUser = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully!",
  });
};

const refreshToken = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Token refreshed successfully!",
      token: newToken,
    });
  });
};

export {
  getUsers,
  createUser,
  loginUser,
  updateUser,
  forgetPassword,
  deleteUser,
  getUserCourses,
  logoutUser,
  getMyProfile,
  refreshToken,
};
