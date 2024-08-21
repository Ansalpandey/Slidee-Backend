import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("HTTP request - ", req.method + " , " + req.url);
  next();
});

// Database connection
connectDB(io);

// WebSocket setup
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  // Listen for specific events and handle them
  socket.on('someEvent', (data) => {
    console.log('Received someEvent:', data);
    // Handle the event, e.g., broadcast updates
    io.emit('update', { message: 'New data available', data });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });
});

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

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

