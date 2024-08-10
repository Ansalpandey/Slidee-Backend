import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import {
  uploadBase64Image,
  uploadVideoOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.util.js";

const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const posts = await Post.find()
      .populate("createdBy", "name username email profileImage") // Ensure 'username', 'email', and 'profileImage' are valid fields in User schema
      .populate("comments", "content")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalPosts = await Post.countDocuments();

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
  const { content, imageUrlBase64 } = req.body;
  const createdBy = req.user ? req.user._id : null;

  if (!createdBy) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    let imageUrl = [];
    let videoUrl = "";

    // Ensure imageUrlBase64 is an array
    const imageBase64Array = Array.isArray(imageUrlBase64) ? imageUrlBase64 : [imageUrlBase64];

    // Upload the postImage if it is provided
    if (imageUrlBase64) {
      const imageUrls = await Promise.all(
        imageBase64Array.map(async (base64) => {
          const result = await uploadBase64Image(base64);
          return result.url;
        })
      );
      imageUrl = imageUrls;
    } else if (req.files && req.files.imageUrl && req.files.imageUrl.length > 0) {
      const imageFiles = req.files.imageUrl;
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const result = await uploadOnCloudinary(file.path);
          return result.url;
        })
      );
      imageUrl = imageUrls;
    }

    // Upload video if it is provided
    if (req.files && req.files.videoUrl && req.files.videoUrl.length > 0) {
      const videoFiles = req.files.videoUrl;
      const video = videoFiles[0];
      const videoResult = await uploadVideoOnCloudinary(video.path);
      videoUrl = videoResult.url;

      if (!videoUrl || videoUrl.trim() === "") {
        return res.status(500).json({ message: "Failed to upload video" });
      }
    }

    const post = new Post({
      content,
      imageUrl,
      videoUrl,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    // Save the post to the database
    const savedPost = await post.save();

    // Update the user's posts array
    await User.findByIdAndUpdate(
      createdBy,
      { $push: { posts: savedPost._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("Error in createPost function:", error);
    res.status(409).json({ message: error.message });
  }
};


const bookmarkedPost = async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const postId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the post is already bookmarked
    if (post.bookmarkedBy && post.bookmarkedBy.includes(userId)) {
      return res.status(400).json({ message: "Post already bookmarked" });
    }

    // Add user to bookmarkedBy array in the post
    post.bookmarkedBy = post.bookmarkedBy || [];
    post.bookmarkedBy.push(userId);
    await post.save();

    res.status(200).json({ message: "Post bookmarked successfully" });
  } catch (error) {
    console.error("Error bookmarking post:", error);
    res.status(500).json({ message: error.message });
  }
};


const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content, imageUrlBase64 } = req.body;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Initialize imageUrl with default value
    let imageUrl = { url: "" };

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

    post.content = content;
    post.imageUrl = imageUrl.url;

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await post.remove();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes += 1;
    post.likedBy.push(userId);

    await post.save();

    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: error.message });
  }
};

const unlikePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "Post not liked yet" });
    }

    post.likes -= 1;
    post.likedBy = post.likedBy.filter(
      (id) => id.toString() !== userId.toString()
    );

    await post.save();

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPostLikes = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likes = await User.find({ _id: { $in: post.likedBy } });

    res.status(200).json({
      message: "Post likes retrieved successfully",
      likes,
    });
  } catch (error) {
    console.error("Error retrieving post likes:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
  bookmarkedPost
};
