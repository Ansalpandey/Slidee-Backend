import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Post } from "../models/post.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
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
const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const users = await User.find()
      .populate("courses")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const query = req.query.q || ""; // Extract query from the 'q' query parameter

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: `^${query}`, $options: "i" } }, // Match names starting with the query
        { username: { $regex: `^${query}`, $options: "i" } }, // Match usernames starting with the query
      ],
    })
      .select("-password") // Exclude the password field from the results
      .populate("courses") // Populate the 'courses' field with related data
      .skip((page - 1) * pageSize) // Pagination: Skip the previous pages
      .limit(pageSize) // Pagination: Limit the results to the specified page size
      .exec();

    const totalUsers = await User.countDocuments({
      $or: [
        { name: { $regex: `^${query}`, $options: "i" } }, // Count documents that match the search criteria
        { username: { $regex: `^${query}`, $options: "i" } },
      ],
    });

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUsersBookmarkedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ bookmarkedBy: userId })
      .populate("createdBy", "name username email profileImage")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalPosts = await Post.countDocuments({ bookmarkedBy: userId });

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
      totalPages: Math.ceil(totalPosts / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUsersBookmarkedCourses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courses = await Course.find({ bookmarkedBy: userId })
      .populate("madeBy", "name username email profileImage")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalCourses = await Course.countDocuments({ bookmarkedBy: userId });

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
 * Retrieves the profile of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the user's profile.
 */

const getMyProfile = async (req, res) => {
  let user;
  try {
    // Find the user by ID and exclude posts and password
    user = await User.findById(req.user._id)
      .select("-password -posts") // Exclude posts from the profile response
      .populate({
        path: "courses",
        populate: [
          { path: "madeBy", select: "name username" },
          { path: "enrolledBy", select: "name username" },
        ],
      })
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "madeBy", select: "name username" },
          { path: "enrolledBy", select: "name username" },
        ],
      })
      .populate("followers", "name username profileImage")
      .populate("following", "name username profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count the number of posts for the user
    const postCount = await Post.countDocuments({ createdBy: req.user._id });

    // Return user data with post count
    return res.status(200).json({
      message: "User profile retrieved successfully!",
      user: user,
      postCount: postCount, // Include post count
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const editProfile = async (req, res) => {
  try {
    // Find the user by ID
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Extract data from request body
    const { name, email, bio, age, profileImageBase64, username, location } =
      req.body;

    // Initialize profileImage and coverImage with default values
    let profileImage = { url: "" };

    // Upload the profile picture if it is provided
    if (profileImageBase64) {
      profileImage = await uploadBase64Image(profileImageBase64);
    }

    // Upload the profile picture if it is provided
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }
    // Update the user's profile with the new data
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage && profileImage.url) user.profileImage = profileImage.url;
    if (bio) user.bio = bio;
    if (age) user.age = age;
    if (username) user.username = username;
    if (location) user.location = location;

    // Save the updated user profile
    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getOtherUserProfile = async (req, res) => {
  try {
    // Find the user by ID and populate the relevant fields
    const user = await User.findById(req.params.id)
      .select("-password -posts") // Exclude password and posts
      .populate({
        path: "courses",
        populate: [
          {
            path: "madeBy",
            select: "name username",
          },
          {
            path: "enrolledBy",
            select: "name username",
          },
        ],
      })
      .populate({
        path: "enrolledCourses",
        populate: [
          {
            path: "madeBy",
            select: "name username",
          },
          {
            path: "enrolledBy",
            select: "name username",
          },
        ],
      })
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } }, // Sort posts by creation date in descending order
        populate: [
          {
            path: "createdBy",
            select: "name username profileImage",
          },
          {
            path: "comments",
            populate: {
              path: "createdBy",
              select: "name username profileImage", // Populate comment creator's details
            },
          },
        ],
      })
      .populate("followers", "name username profileImage")
      .populate("following", "name username profileImage");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // Count the number of posts for the user
    const postCount = await Post.countDocuments({ createdBy: req.params.id });

    // Return user data with post count
    return res.status(200).json({
      message: "User profile retrieved successfully!",
      user: user,
      postCount: postCount, // Include post count
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
    location,
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

    // Upload the profile picture if it is provided
    if (profileImageBase64) {
      profileImage = await uploadBase64Image(profileImageBase64);
    }

    // Upload the profile picture if it is provided
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      age,
      username,
      bio,
      password,
      location: "",
      profileImage: profileImage.url,
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
        location: result.location,
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
    const isMatch = await user.isPasswordCorrect(password, user.password);
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
      expiresIn: "15d",
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
        bio: user.bio,
        enrolledCourses: user.enrolledCourses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const requestOTP = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP using the crypto package
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store the OTP in the user's document
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    user.save();

    // Send the OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `<h2>Your OTP is ${otp}</h2><p>Please use this OTP to reset your password. It will expire in 15 minutes.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({
          message: "OTP sent to your email",
        });
      }
    });
  });
};

const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP is correct and has not expired
    if (user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  });
};

const forgetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    await User.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    );

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error });
  }
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
const getUserCourses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const userId = req.user._id;
    console.log("User ID from token:", userId); // Log the user ID for debugging

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courses = await Course.find({ madeBy: userId })
      .populate("madeBy", "name username")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this user" });
    }

    const totalCourses = await Course.countDocuments({ madeBy: userId });

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
  // Ensure the Authorization header is present
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  // Verify and decode the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ message: "Forbidden" });
    }

    // Log the decoded payload for debugging
    console.log("Token verified successfully. Decoded payload:", decoded);
    // Create a new token with the same user details
    const payload = {
      user: {
        id: decoded.user.id,
        email: decoded.user.email,
        username: decoded.user.username,
      },
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15d", // Set expiration time as needed
    });

    console.log("New Token:", newToken);

    return res.status(200).json({
      message: "Token refreshed successfully!",
      token: newToken,
    });
  });
};

const followUser = async (req, res) => {
  const userId = req.params.id;
  const followerId = req.user._id;

  try {
    // Check if the user is trying to follow themselves
    if (userId === followerId.toString()) {
      return res
        .status(400)
        .json({ message: "Users cannot follow themselves" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the follower exists
    const follower = await User.findById(followerId);
    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Check if the user is already followed
    const isFollowing = user.followers.includes(followerId);
    if (isFollowing) {
      // Unfollow the user
      user.followers.pull(followerId);
      user.followersCount -= 1;
      await user.save();

      follower.following.pull(userId);
      follower.followingCount -= 1;
      await follower.save();

      return res.status(200).json({
        message: "User unfollowed successfully",
        follower: {
          id: follower._id,
          name: follower.name,
          username: follower.username,
          profileImage: follower.profileImage,
        },
      });
    } else {
      // Follow the user
      user.followers.push(followerId);
      user.followersCount += 1;
      await user.save();

      follower.following.push(userId);
      follower.followingCount += 1;
      await follower.save();

      return res.status(200).json({
        message: "User followed successfully",
        follower: {
          id: follower._id,
          name: follower.name,
          username: follower.username,
          profileImage: follower.profileImage,
        },
      });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getFollowers = async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await User.find({ _id: { $in: user.followers } })
      .select("name username profileImage bio")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalFollowers = user.followers.length;

    return res.status(200).json({
      message: "User followers retrieved successfully",
      followers,
      totalPages: Math.ceil(totalFollowers / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving user followers:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getFollowings = async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = await User.find({ _id: { $in: user.following } })
      .select("name username bio profileImage")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalFollowing = user.following.length;

    return res.status(200).json({
      message: "User following retrieved successfully",
      following,
      totalPages: Math.ceil(totalFollowing / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving user following:", error);
    return res.status(500).json({ message: error.message });
  }
};

const isFollowing = async (req, res) => {
  const userId = req.params.id;
  const followerId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.includes(followerId);

    return res.status(200).json({
      message: "User following status retrieved successfully",
      isFollowing,
    });
  } catch (error) {
    console.error("Error checking if user is following:", error);
    return res.status(500).json({ message: error.message });
  }
};

const removeFollower = async (req, res) => {
  const userId = req.params.id;
  const followerId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const follower = await User.findById(followerId);

    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    user.followers.pull(followerId);
    user.followersCount -= 1;

    await user.save();

    follower.following.pull(userId);
    follower.followingCount -= 1;

    await follower.save();

    return res.status(200).json({
      message: "Follower removed successfully",
      follower: {
        id: follower._id,
        name: follower.name,
        username: follower.username,
        profileImage: follower.profileImage,
      },
    });
  } catch (error) {
    console.error("Error removing follower:", error);
    return res.status(500).json({ message: error.message });
  }
};

const sendDeviceToken = async (req, res) => {
  const userId = req.user._id; // Authenticated user's ID
  const { token } = req.body; // Token from request body

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save the token in user's profile
    user.deviceToken = token;
    await user.save();

    return res.status(200).json("Token saved successfully");
  } catch (error) {
    console.error("Error saving device token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDeviceToken = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    return res.status(200).json({ token: user.deviceToken });
  } catch (error) {
    console.error("Error retrieving device token:", error);
    return res.status(500).json("Internal server error");
  }
};

export {
  getUsers,
  createUser,
  loginUser,
  forgetPassword,
  deleteUser,
  getUserCourses,
  logoutUser,
  getMyProfile,
  refreshToken,
  followUser,
  getFollowers,
  getFollowings,
  getOtherUserProfile,
  isFollowing,
  editProfile,
  searchUsers,
  getUsersBookmarkedPosts,
  getUsersBookmarkedCourses,
  requestOTP,
  verifyOTP,
  removeFollower,
  sendDeviceToken,
  getDeviceToken
};
