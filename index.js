import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/db.js";
// Start WebSocket server on a different port
const wsServer = http.createServer();
const io = new Server(wsServer);
dotenv.config();

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ limit: "5gb", extended: true }));
app.use(bodyParser.json({ limit: "5gb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("HTTP request - ", req.method + " , " + req.url);
  next();
});

// Database connection
connectDB(io);

// Routes
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import lessonRouter from "./routes/lesson.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";

// Endpoints
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/courses/", courseRouter);
app.use("/api/v1/lessons/", lessonRouter);
app.use("/api/v1/posts/", postRouter);
app.use("/api/v1/posts/", commentRouter);

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 3000, () => {
  console.log("HTTP Server started on port", process.env.PORT || 3000);
});

io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);
  socket.on("user events", (data) => {
    console.log("Received user events:", data);
    io.emit("update", { message: "New data available", data });
  });

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected:", socket.id);
  });
});

wsServer.listen(process.env.WS_PORT || 4000, () => {
  console.log("WebSocket Server started on port", process.env.WS_PORT || 4000);
});
