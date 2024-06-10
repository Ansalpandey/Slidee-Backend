const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getUsers = (req, res) => {
  userModel.find().then((result) => {
    return res.status(200).json({
      message: "Users retrieved successfully!",
      users: result,
    });
  });
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user instance
    user = new userModel({
      name,
      email,
      password,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    const result = await user.save();

    // Create a JWT payload
    const payload = {
      user: {
        id: result.id,
      },
    };

    // Sign the JWT token
    jwt.sign(payload, "your_jwt_secret", { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;

      // Set the token in a cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Adjust according to your needs
        maxAge: '1d', // 1 day
      });

      return res.status(201).json({
        message: "User created successfully!",
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
        },
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      let user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }
  
      // Create a JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };
  
      // Sign the JWT token
      jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
  
        // Set the token in a cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'strict', // Adjust according to your needs
          maxAge: 3600000 // 1 hour
        });
  
        return res.status(200).json({
          message: 'Logged in successfully!',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  };

exports.getUserById = (req, res) => {
  userModel.findById(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User retrieved successfully!",
      user: result,
    });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  // Ensure the userId is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(userId)) {
    userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .then((result) => {
        if (result) {
          return res.status(200).json({
            message: "User updated successfully!",
            user: result,
          });
        } else {
          return res.status(404).json({
            message: "User not found!",
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Error updating user",
          error: err,
        });
      });
  } else {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

exports.deleteUser = (req, res) => {
  userModel.findByIdAndDelete(req.params.id).then((result) => {
    return res.status(200).json({
      message: "User deleted successfully!",
      user: result,
    });
  });
};
