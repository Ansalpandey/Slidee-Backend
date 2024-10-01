import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "slidee-app",
  brokers: ["192.168.1.7:9092"],
});

const consumer = kafka.consumer({ groupId: "slidee-group" });
const url = process.env.MONGO_URL_LOCAL;

let postBatch = [];
let userPostIdsBatch = {};

// MongoDB connection function
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

// Kafka consumer wrapper function
export const startConsumer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();

    console.log("Connecting to Kafka...");
    await consumer.connect();
    console.log("Kafka consumer connected successfully!");

    await consumer.subscribe({ topic: "create-posts", fromBeginning: true });

    console.log("Subscribed to topic: create-posts");

    consumer.run({
      eachMessage: async ({ topic, message }) => {
        const parsedMessage = JSON.parse(message.value.toString());

        try {
          switch (topic) {
            case "create-posts":
              await handlePostCreation(parsedMessage);
              break;
            default:
              console.log(`Unhandled topic: ${topic}`);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });

    // Set up periodic batch insert every 30 seconds
    setInterval(async () => {
      await insertPostsInBatch();
    }, 30000);
  } catch (error) {
    console.error("Error starting Kafka consumer:", error);
  }
};

// Handle Post Creation (Batch and Insert)
const handlePostCreation = async ({ content, imageUrl, videoUrl, createdBy }) => {
  try {
    // Add post to the batch
    postBatch.push({
      content,
      imageUrl,
      videoUrl,
      createdBy: new mongoose.Types.ObjectId(createdBy),
      createdAt: new Date(),
    });

    // Initialize userPostIdsBatch for the user if not already initialized
    if (!userPostIdsBatch[createdBy]) {
      userPostIdsBatch[createdBy] = [];
    }

    console.log(`Post added to batch. Batch size: ${postBatch.length}`);

    // If the batch reaches 5000, insert immediately
    if (postBatch.length >= 5000) {
      await insertPostsInBatch();
    }
  } catch (error) {
    console.error("Error handling post creation:", error);
  }
};

// Insert posts in batch
const insertPostsInBatch = async () => {
  if (postBatch.length === 0) {
    console.log("No posts to process.");
    return;
  }

  try {
    console.log(`Inserting batch of ${postBatch.length} posts...`);

    // Bulk insert posts
    const savedPosts = await Post.insertMany(postBatch);

    // After saving, associate the posts with respective users
    savedPosts.forEach((savedPost) => {
      const userId = savedPost.createdBy.toString();
      userPostIdsBatch[userId].push(savedPost._id);
    });

    // Update users' posts arrays in batch
    await Promise.all(
      Object.keys(userPostIdsBatch).map(async (userId) => {
        const postIds = userPostIdsBatch[userId];
        if (postIds.length > 0) {
          try {
            console.log(`Updating posts array for user ${userId}`);
            await User.findByIdAndUpdate(
              userId,
              { $push: { posts: { $each: postIds } } },
              { new: true }
            );
            console.log(`Updated posts array for user ${userId}`);
          } catch (error) {
            console.error(`Error updating posts array for user ${userId}:`, error);
          }
        }
      })
    );

    // Clear the batch after successful insertion and update
    postBatch = [];
    userPostIdsBatch = {};
    console.log("Batch insert completed and cleared.");
  } catch (error) {
    console.error("Error during batch insertion:", error);
  }
};

export default consumer;
