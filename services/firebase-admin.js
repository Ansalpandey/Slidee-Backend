// Import and initialize Firebase Admin SDK
import admin from "firebase-admin";
import { readFile } from 'fs/promises';

// Read the service account JSON
const serviceAccount = JSON.parse(
  await readFile(new URL('./slidee-admin.json', import.meta.url))
);

// Initialize Firebase
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

// Function to send a notification
const sendLikeNotification = async (deviceToken, postId, likedByUser) => {
  const payload = {
    notification: {
      title: `${likedByUser.username} liked your post.`,
    },
    data: {
      link: `/posts/${postId}`,
      username: likedByUser.username,
    },
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export { sendLikeNotification };
