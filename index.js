import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { connectDB } from "./db/db.js";
const app = express();

//Middlewares
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("HTTP request - ", req.method + " , " + req.url);
  next();
});

//Database connection
connectDB();

//Routes
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import lessonRouter from "./routes/lesson.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";

//Endpoints
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/courses/", courseRouter);
app.use("/api/v1/lessons/", lessonRouter);
app.use("/api/v1/posts/", postRouter);
app.use("/api/v1/posts/", commentRouter);

// //Server running
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
