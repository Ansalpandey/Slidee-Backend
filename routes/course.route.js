import express from "express";
const router = express.Router();
import {
  getCourses,
  createCourse,
  updateCourse,
  findCourse,
  deleteCourse,
  getCourseById,
} from "../controller/course.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.use(auth);

router.get("/", (req, res) => {
  getCourses(req, res);
});

router.post("/create", upload.fields([{ name: 'thumbnail', maxCount: 1 }]), (req, res) => {
  createCourse(req, res);
});

router.put("/:id", (req, res) => {
  updateCourse(req, res);
});

router.delete("/:id", (req, res) => {
  deleteCourse(req, res);
});

router.post("/find", (req, res) => {
  findCourse(req, res);
});

router.get("/find/:id", (req, res) => {
  getCourseById(req, res);
});

export default router;
