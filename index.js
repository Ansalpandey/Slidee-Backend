import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/db.js";
import morgan from "morgan";
const wsServer = http.createServer();
const io = new Server(wsServer);
dotenv.config();
import {startConsumer} from "./kafka/kafka.consumer.js";
import { collectDefaultMetrics, Histogram, register } from 'prom-client';
import responseTime from "response-time";

const app = express();
collectDefaultMetrics({
  register: register
});
app.get("/metrics", async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  const matrics = await register.metrics();
  res.send(matrics);
});

const reqResTime = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [100, 500, 1000, 5000]
});
app.use(responseTime((req, res, time) => {
  const path = req.route ? req.route.path : 'unknown';
  reqResTime
    .labels(req.method, path, res.statusCode)
    .observe(time);
}));

// Middlewares
app.use(express.json({ limit: '50mb' }));  // Increase limit to 50MB or more
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(morgan("dev"));

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

// Start the server and Kafka consumer
app.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${process.env.PORT}`);

  // Start the Kafka consumer when the server starts
  try {
    await startConsumer();
    console.log("Kafka consumer started successfully");
  } catch (error) {
    console.error("Error starting Kafka consumer:", error);
  }
});