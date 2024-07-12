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
  const user = req.user;
  const createdBy = req.user._id;

  try {
    console.log("Starting createPost function...");

    // Initialize imageUrl and videoUrl with default values
    let imageUrl = { url: "" };
    let videoUrl = { url: "" };

    // Upload the postImage if it is provided
    if (imageUrlBase64) {
      console.log("Uploading base64 image...");
      imageUrl = await uploadBase64Image(imageUrlBase64);
    } else if (
      req.files &&
      req.files.imageUrl &&
      req.files.imageUrl.length > 0
    ) {
      console.log("Uploading image file...");
      const imageFiles = req.files.imageUrl;
      console.log("Image files received:", imageFiles);
      imageUrl = await uploadOnCloudinary(imageFiles[0].path);
    }

    // Upload video if it is provided
    if (req.files && req.files.videoUrl && req.files.videoUrl.length > 0) {
      console.log("Uploading video file...");
      const videoFiles = req.files.videoUrl;
      console.log("Video files received:", videoFiles);
      const video = videoFiles[0];
      console.log("Video file path:", video.path);
      videoUrl = await uploadVideoOnCloudinary(video.path);

      // Ensure videoUrl has a valid url property
      if (!videoUrl || !videoUrl.url || videoUrl.url.trim() === "") {
        return res.status(500).json({ message: "Failed to upload video" });
      }

      console.log("Uploaded video URL:", videoUrl.url);
    }

    const post = new Post({
      title,
      content,
      imageUrl: imageUrl.url,
      videoUrl: videoUrl.url,
      createdBy: new mongoose.Types.ObjectId(createdBy), // Directly use req.user._id if it's already an ObjectId
    });

    await post.save();
    console.log("Post created successfully:", post);

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
