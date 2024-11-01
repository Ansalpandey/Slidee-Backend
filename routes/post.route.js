import express from "express";
const router = express.Router();

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
  bookmarkedPost,
  getPostsByUserId,
  deleteAllPostsOfUser
} from "../controller/post.controller.js";

import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.use(auth);

router.get("/", (req, res) => {
  getPosts(req, res);
});

router.get("/:id", (req, res) => {
  getPost(req, res);
});

router.post(
  "/create",
  upload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    createPost(req, res);
  }
);

router.put("/:id", (req, res) => {
  updatePost(req, res);
});

router.delete("/:id", (req, res) => {
  deletePost(req, res);
});

router.post("/:id/like", (req, res) => {
  likePost(req, res);
});

router.post("/:id/unlike", (req, res) => {
  unlikePost(req, res);
});

router.get("/:id/likes", (req, res) => {
  getPostLikes(req, res);
});

router.post("/:id/bookmark", (req, res) => {
  bookmarkedPost(req, res);
});

router.get("/users/:id", (req, res) => {
  getPostsByUserId(req, res);
});

router.delete("/:id/deleteAll", (req, res) => {
  deleteAllPostsOfUser(req, res);
});

export default router;