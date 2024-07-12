import express from "express";
const router = express.Router();

import {getPosts, getPost, createPost} from "../controller/post.controller.js";

import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.use(auth);

router.get("/", (req, res) => {
  getPosts(req, res);
});

router.get("/:id", (req, res) => {
  getPost(req, res);
});

router.post("/create", upload.fields([
  { name: 'videoUrl', maxCount: 1 },
  { name: 'imageUrl', maxCount: 5 },
]), (req, res) => {
  createPost(req, res);
});

export default router;