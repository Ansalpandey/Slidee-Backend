import express from "express";
const router = express.Router();
import {
  createComment,
  updateComment,
  deleteComment,
  getComments,
} from "../controller/comment.controller.js";
import { auth } from "../middleware/auth.middleware.js";

router.use(auth);

router.post("/:id/comments", createComment);

router.get("/:id/comments", getComments);

router.put("/:id/comments/:commentId", updateComment);

router.delete("/:id/comments/:commentId", deleteComment);

export default router;
