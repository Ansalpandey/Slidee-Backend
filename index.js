const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

//Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Database connection
const connectDB = require("./db/db");
connectDB();
//Routes
const userRouter = require("./routes/user.route");
const courseRouter = require("./routes/course.route");

//Endpoints
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/courses/", courseRouter);

app.listen(3000, () => {
  console.log("Server started");
});

module.exports.handler = serverless(app);
