import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

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

const getMyProfile = (req, res) => {
  User.findById(req.user.id, "-password")
    .populate("courses")
    .then((result) => {
      return res.status(200).json({
        message: "User retrieved successfully!",
        user: result,
      });
    })
    .catch((error) => {
      console.error("Error retrieving user:", error);
      return res.status(500).json({ message: "Server error" });
    });
};

const createUser = async (req, res) => {
  const { name, email, password, age, username, bio } = req.body;

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

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    res.header("AccessToken", token);

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
        // token: token,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

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
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.header("AccessToken", token);
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
            // token: token,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
};

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

const deleteUser = (req, res) => {
  User.findByIdAndDelete(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User deleted successfully!",
      user: result,
    });
  });
};

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

const logoutUser = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully!",
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
};
