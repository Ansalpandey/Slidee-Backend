import express from "express";
const router = express.Router();
import {createComment, updateComment, deleteComment} from "../controller/comment.controller.js";
import {auth} from "../middleware/auth.middleware.js";

router.post("/:id/comments", auth, createComment);

router.put("/:id/comments/:commentId", auth, updateComment);

router.delete("/:id/comments/:commentId", auth, deleteComment);

export default router;