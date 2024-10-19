import mongoose from "mongoose";

// Define a general schema for notifications
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ['follow', 'like_post', 'comment_post', 'like_comment'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String, // Optional link (e.g., post link, profile link)
  },
  // This field will store different types of data based on notification type
  details: {
    follower: {
      name: String,
      username: String,
      profileImage: String,
    },
    post: {
      id: mongoose.Schema.Types.ObjectId,
      title: String, // Example field for post details
      name: String,
      username: String,
      profileImage: String,
    },
    comment: {
      id: mongoose.Schema.Types.ObjectId,
      text: String, // Example field for comment text
      name: String,
      username: String,
      profileImage: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '30d' }, // TTL index to remove documents after 30 days
    },
  },
}, { timestamps: true });

// Set up a function to dynamically populate the details based on notification type
notificationSchema.methods.createNotification = function(type, data) {
  this.type = type;

  // Populate notification details based on the type
  switch (type) {
    case 'follow':
      this.message = `${data.follower.name} started following you.`;
      this.details.follower = {
        name: data.follower.name,
        username: data.follower.username,
        profileImage: data.follower.profilePicture,
      };
      break;
    case 'like_post':
      this.message = `liked your post.`;
      this.details.post = {
        id: data.post.id,
        title: data.post.title,
        name: data.post.name,
        username: data.post.username,
        profileImage: data.post.profilePicture,
      };
      break;
    case 'comment_post':
      this.message = `${data.user.name} commented on your post.`;
      this.details.post = {
        id: data.post.id,
        title: data.post.title,
      };
      this.details.comment = {
        id: data.comment.id,
        text: data.comment.text,
      };
      break;
    case 'like_comment':
      this.message = `${data.user.name} liked your comment.`;
      this.details.comment = {
        id: data.comment.id,
        text: data.comment.text,
      };
      break;
    default:
      throw new Error("Unknown notification type");
  }

  return this;
};

// Create a Mongoose model for notifications
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;