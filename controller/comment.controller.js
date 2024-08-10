import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

const createComment = async (req, res) => {
  const { content } = req.body;
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = new Comment({
      content,
      createdBy: userId,
      postId: id,
    });

    await comment.save();

    post.comments.push(comment);
    post.commentsCount = post.comments.length;

    await post.save();

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate("comments");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  const { content } = req.body;
  const { id, commentId } = req.params;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "User not authorized" });
    }

    comment.content = content;

    await comment.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await comment.remove();

    post.comments.pull(commentId);
    post.commentsCount = post.comments.length;

    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: error.message });
  }
};

export { createComment, updateComment, deleteComment, getComments };
