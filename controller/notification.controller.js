import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  const { id } = req.params;
  try {
    const notifications = await Notification.find({ user: id })
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
