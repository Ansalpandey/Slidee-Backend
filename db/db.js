import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
/**
 * Connects to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is successful or rejects with an error.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URL,
      // process.env.MONGO_URL_LOCAL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.log("Error connecting to MongoDB");
  }
};

export { connectDB };
