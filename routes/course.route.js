const express = require("express");
const router = express.Router();
const courseController = require("../controller/course.controller");
const auth = require("../middleware/auth.middleware");

router.use(auth);

router.get("/", (req, res) => {
  courseController.getCourses(req, res);
});

router.post("/create", (req, res) => {
  courseController.createCourse(req, res);
});

router.put("/:id", (req, res) => {
  courseController.updateCourse(req, res);
});

router.delete("/:id", (req, res) => {
  courseController.deleteCourse(req, res);
});

router.post("/find", (req, res) => {
  courseController.findCourse(req, res);
});

router.get("/find/:id", (req, res) => {
  courseController.getCourseById(req, res);
});

module.exports = router;
