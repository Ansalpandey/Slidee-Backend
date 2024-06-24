const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

router.get("/", auth, (req, res) => {
  userController.getUsers(req, res);
});

router.route("/register").post(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  (req, res) => {
    userController.createUser(req, res);
  }
);

router.post("/login", (req, res) => {
  userController.loginUser(req,res);
});

router.get("/:id", auth, (req, res) => {
  userController.getUserById(req, res);
});

router.put("/:id", auth, (req, res) => {
  userController.updateUser(req, res);
});

router.delete("/:id", auth, (req, res) => {
  userController.deleteUser(req, res);
});

router.post("/reset", (req, res) => {
  userController.forgetPassword(req, res);
});

router.post("/logout", (req, res) => {
  userController.logoutUser(req, res);
});

router.get("/courses/:id", auth, (req, res) => {
  userController.getUserCourses(req, res);
});

module.exports = router;
