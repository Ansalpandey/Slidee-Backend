import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
/**
 * Connects to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is successful or rejects with an error.
 */
const connectDB = async (io) => {
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
    // Array of collection names to watch
    const collectionsToWatch = [
      "users",
      "posts",
      "lessons",
      "courses",
      "comments",
    ];

    collectionsToWatch.forEach((collectionName) => {
      const collection = mongoose.connection.collection(collectionName);
      const changeStream = collection.watch();

      changeStream.on("change", (change) => {
        console.log(`Change detected in ${collectionName} collection:`, change);

        // Emit changes based on the operation type
        switch (change.operationType) {
          case "insert":
            io.emit(`${collectionName}Insert`, change.fullDocument);
            break;
          case "update":
            io.emit(`${collectionName}Update`, {
              id: change.documentKey._id,
              update: change.updateDescription,
            });
            break;
          case "delete":
            io.emit(`${collectionName}Delete`, change.documentKey._id);
            break;
          default:
            console.log(
              `Unhandled change operation in ${collectionName} collection:`,
              change.operationType
            );
        }
      });
    });
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

export { connectDB };
