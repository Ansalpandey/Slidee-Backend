import express from "express";
const router = express.Router();
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
  getPublishedLessons,
  getLessonById,
} from "../controller/lesson.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.use(auth);

router.get("/", (req, res) => {
  getLessons(req, res);
});

router.post(
  "/create",
  upload.fields([
    {
      name: "videoUrl",
      maxCount: 1,
    },
  ]),
  (req, res) => {
    createLesson(req, res);
  }
);

router.put("/:id", (req, res) => {
  updateLesson(req, res);
});

router.delete("/:id", (req, res) => {
  deleteLesson(req, res);
});

router.post("/find", (req, res) => {
  getLessonsByCourse(req, res);
});

router.get("/find/:id", (req, res) => {
  getLessonById(req, res);
});

router.get("/published", (req, res) => {
  getPublishedLessons(req, res);
});

export default router;
