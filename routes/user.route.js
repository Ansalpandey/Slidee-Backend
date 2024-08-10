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
  isFollowing,
  followUser,
  getFollowers,
  getOtherUserProfile,
  getFollowings,
  editProfile,
  searchUsers
} from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

router.get("/", auth, (req, res) => {
  getUsers(req, res);
});

router
  .route("/register")
  .post(upload.fields([{ name: "profileImage", maxCount: 1 }]), (req, res) => {
    createUser(req, res);
  });

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

router.get("/courses", auth, (req, res) => {
  getUserCourses(req, res);
});

router.get("/profile", auth, (req, res) => {
  getMyProfile(req, res);
});

router.get("/profile/:id", auth, (req, res) => {
  getOtherUserProfile(req, res);
});

router.get("/refresh-token", (req, res) => {
  refreshToken(req, res);
});

router.get("/posts", auth, (req, res) => {
  getUserPosts(req, res);
});

router.post("/follow/:id", auth, (req, res) => {
  followUser(req, res);
});

router.get("/followers/:id", auth, (req, res) => {
  getFollowers(req, res);
});

router.get("/is-following/:id", auth, (req, res) => {
  isFollowing(req, res);
});

router.get("/followings/:id", auth, (req, res) => {
  getFollowings(req, res);
});

router.get("/search", auth, (req, res) => {
  searchUsers(req, res);
});

router.put(
  "/edit-profile/:id",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  auth,
  (req, res) => {
    editProfile(req, res);
  }
);

export default router;
