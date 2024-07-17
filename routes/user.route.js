import express from "express";
const router = express.Router();
import {
  getUsers,
  createUser,
  loginUser,
  updateUser,
  forgetPassword,
  deleteUser,
  getUserCourses,
  logoutUser,
  getMyProfile,
  refreshToken,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowings,
} from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.get("/", auth, (req, res) => {
  getUsers(req, res);
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
    createUser(req, res);
  }
);

router.post("/login", (req, res) => {
  loginUser(req, res);
});

router.put("/:id", auth, (req, res) => {
  updateUser(req, res);
});

router.delete("/:id", auth, (req, res) => {
  deleteUser(req, res);
});

router.post("/reset", (req, res) => {
  forgetPassword(req, res);
});

router.post("/logout", auth, (req, res) => {
  logoutUser(req, res);
});

router.get("/courses/:id", auth, (req, res) => {
  getUserCourses(req, res);
});

router.get("/profile", auth, (req, res) => {
  getMyProfile(req, res);
});

router.post("/refresh-token", auth, (req, res) => {
  refreshToken(req, res);
});

router.get("/posts", auth, (req, res) => {
  getUserPosts(req, res);
});

router.post("/follow/:id", auth, (req, res) => {
  followUser(req, res);
});

router.post("/unfollow/:id", auth, (req, res) => {
  unfollowUser(req, res);
});

router.get("/followers/:id", auth, (req, res) => {
  getFollowers(req, res);
});

router.get("/followings/:id", auth, (req, res) => {
  getFollowings(req, res);
});

export default router;
