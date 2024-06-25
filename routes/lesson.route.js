const express = require("express");
const router = express.Router();
const lessonController = require("../controller/lessons.controller");
const auth = require("../middleware/auth.middleware");
router.use(auth);

router.get("/", (req, res) => {
  lessonController.getLessons(req, res);
});

router.route("/create").post(
  (req, res) => {
    lessonController.createLesson(req, res);
  }
);

router.put("/:id", (req, res) => {
  lessonController.updateLesson(req, res);
});

router.delete("/:id", (req, res) => {
  lessonController.deleteLesson(req, res);
});

router.post("/find", (req, res) => {
  lessonController.findLesson(req, res);
});

router.get("/find/:id", (req, res) => {
  lessonController.findLessonById(req, res);
});

module.exports = router;
