import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import { io, connectedUsers } from '../index.js';  // Import WebSocket server and connected users map

export const createNotification = async (req, res) => {
  const { userId, message, link, type } = req.body;
  console.log('Received request:', { userId, message, link });
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create and save the notification
    const notification = new Notification({ user: userId, message, link, type});
    await notification.save();
    console.log('Notification created:', notification);

    // Check if the user is connected via WebSocket
    const socketId = connectedUsers[userId];
    if (socketId) {
      // Emit the notification to the specific user's WebSocket connection
      io.to(socketId).emit('new_notification', notification);
      console.log(`Notification sent to user ${userId} via WebSocket`);
    }
console.log('Notification created:', notification);

    return res.status(201).json(notification);

  }
  catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: error.message });
  }
};


export const getNotifications = async (req, res) => {
  const { id } = req.params;
  try {
    const notifications = await Notification.find({ user: id }).populate('user', 'name username profileImage');
    return res.status(200).json(notifications);
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
