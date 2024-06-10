const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URL,
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

module.exports = connectDB;
