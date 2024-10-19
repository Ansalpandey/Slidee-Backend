import { getNotifications } from "../controller/notification.controller.js";
import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/:id", auth, (req, res) => {
  getNotifications(req, res);
});

export default router;