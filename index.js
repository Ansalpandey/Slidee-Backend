const serverless = require("serverless-http");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Database connection
const connectDB = require("./db/db");
connectDB();
//Routes
const userRouter = require("./routes/user.route");

//Endpoints
app.use("/api/v1/users/", userRouter);

// app.listen(3000, () => {
//   console.log("Server started");
// });

module.exports.handler = serverless(app);
