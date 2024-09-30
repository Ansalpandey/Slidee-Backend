import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'slidee-app',
  brokers: ['192.168.1.7:9092'],
});

const consumer = kafka.consumer({ groupId: 'slidee-group' });
const postBatch = {};
const userPostIdsBatch = {}; // Store post IDs to update user's posts array
const url = process.env.MONGO_URL_LOCAL;

// MongoDB connection function
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Wait for MongoDB connection
const waitForMongoConnection = async () => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB is already connected');
      resolve();
    } else {
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established');
        resolve();
      });

      mongoose.connection.on('error', (err) => {
        console.error('Error in MongoDB connection:', err);
        reject(err);
      });
    }
  });
};

// Kafka consumer wrapper function
export const startConsumer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    await waitForMongoConnection();

    console.log('Connecting to Kafka...');
    await consumer.connect();
    console.log('Connected to Kafka!');

    await consumer.subscribe({ topic: 'create-posts', fromBeginning: true });
    console.log("Subscribed to 'create-posts' topic!");

    console.log('Starting to process messages...');
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { content, imageUrl, videoUrl, createdBy, createdAt } = JSON.parse(message.value);
          console.log(JSON.parse(message.value));

          // Initialize postBatch and userPostIdsBatch for the user if not already initialized
          if (!postBatch[createdBy]) {
            postBatch[createdBy] = [];
            userPostIdsBatch[createdBy] = [];
          }

          // Add the post to the batch
          postBatch[createdBy].push({
            content,
            imageUrl,
            videoUrl,
            createdBy: new mongoose.Types.ObjectId(createdBy),
            createdAt: createdAt || new Date(),
          });

          console.log(`Added post to batch for user ${createdBy}`);
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });

    // Periodically update the database with batched posts
    setInterval(async () => {
      try {
        const userPosts = Object.values(postBatch).flat();

        if (userPosts.length > 0) {
          console.log(`Processing ${userPosts.length} posts in batches...`);
          const BATCH_SIZE = 50000;

          if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB is not connected, skipping batch insertion');
            return;
          }

          for (let i = 0; i < userPosts.length; i += BATCH_SIZE) {
            const batch = userPosts.slice(i, i + BATCH_SIZE);

            try {
              console.log(`Inserting batch of ${batch.length} posts...`);
              const savedPosts = await Post.insertMany(batch);

              // Store post IDs in userPostIdsBatch to update the user's posts array
              savedPosts.forEach((savedPost) => {
                const userId = savedPost.createdBy.toString();
                userPostIdsBatch[userId].push(savedPost._id);
              });

              console.log(`Inserted ${batch.length} posts successfully`);
            } catch (error) {
              console.error('Error inserting posts in bulk:', error);
            }
          }

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

          // Clear batches after successful insertion and update
          Object.keys(postBatch).forEach((userId) => delete postBatch[userId]);
          Object.keys(userPostIdsBatch).forEach((userId) => delete userPostIdsBatch[userId]);

          console.log('Cleared postBatch and userPostIdsBatch after successful insertion.');
        } else {
          console.log('No posts to process.');
        }
      } catch (error) {
        console.error('Error during batch processing:', error);
      }
    }, 30000); // Update every 30 seconds
  } catch (error) {
    console.error('Error initializing Kafka consumer:', error);
  }
};

export default consumer;
