import { createNotification, getNotifications } from "../controller/notification.controller.js";
import { Router } from "express";
import {auth} from "../middleware/auth.middleware.js";
const router = Router();

router.post("/", (req, res) => {
  createNotification(req, res);
});

router.get("/:id", (req, res) => {
  getNotifications(req, res);
});

export default router;