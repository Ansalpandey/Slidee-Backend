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
    const userCollection = mongoose.connection.collection('users');
    const changeStream = userCollection.watch();

    changeStream.on('change', (change) => {
      console.log("Change detected:", change);

      // Emit changes based on the operation type
      switch (change.operationType) {
        case 'insert':
          io.emit('dbInsert', change.fullDocument);
          break;
        case 'update':
          io.emit('dbUpdate', { 
            id: change.documentKey._id, 
            update: change.updateDescription 
          });
          break;
        case 'delete':
          io.emit('dbDelete', change.documentKey._id);
          break;
        default:
          console.log("Unhandled change operation:", change.operationType);
      }
    });

  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

export { connectDB };