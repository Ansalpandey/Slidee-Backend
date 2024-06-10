const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, (req, res) => {
  userController.getUsers(req, res);
});

router.post("/register", (req, res) => {
  userController.createUser(req, res);
});

router.post("/login", (req, res) => {
  userController.loginUser(req, res);
});

router.get("/:id", (req, res) => {
  userController.getUserById(req, res);
});

router.put("/:id", (req, res) => {
  userController.updateUser(req, res);
});

router.delete("/:id", (req, res) => {
  userController.deleteUser(req, res);
});

module.exports = router;
