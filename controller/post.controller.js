import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import {
  uploadBase64Image,
  uploadVideoOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.util.js";

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "name") // Ensure 'name' is a valid field in User schema
      .exec();
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate("createdBy", "username email") // Ensure 'username' and 'email' are valid fields in User schema
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      post,
    });
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  const { title, content, imageUrlBase64 } = req.body;
  const createdBy = req.user ? req.user._id : null;

  if (!createdBy) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Initialize imageUrl and videoUrl with default values
    let imageUrl = { url: "" };
    let videoUrl = { url: "" };

    // Upload the postImage if it is provided
    if (imageUrlBase64) {
      imageUrl = await uploadBase64Image(imageUrlBase64);
    } else if (
      req.files &&
      req.files.imageUrl &&
      req.files.imageUrl.length > 0
    ) {
      const imageFiles = req.files.imageUrl;
      imageUrl = await uploadOnCloudinary(imageFiles[0].path);
    }

    // Upload video if it is provided
    if (req.files && req.files.videoUrl && req.files.videoUrl.length > 0) {
      const videoFiles = req.files.videoUrl;
      const video = videoFiles[0];
      videoUrl = await uploadVideoOnCloudinary(video.path);

      // Ensure videoUrl has a valid url property
      if (!videoUrl || !videoUrl.url || videoUrl.url.trim() === "") {
        return res.status(500).json({ message: "Failed to upload video" });
      }
    }

    const post = new Post({
      title,
      content,
      imageUrl: imageUrl.url,
      videoUrl: videoUrl.url,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    await post.save();

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error in createPost function:", error);
    res.status(409).json({ message: error.message });
  }
};


export { getPosts, getPost, createPost };
