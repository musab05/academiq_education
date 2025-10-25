// server.js
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { initializeSignalingServer } from "./services/signalingServer.js";

// Import all models to ensure they are registered with Mongoose
import "./models/index.js";
import "./models/AssignmentSubmission.js";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessons.js";
import activityRoutes from "./routes/activities.js";
import uploadRoutes from "./routes/upload.js";
import textLessonRoutes from "./routes/textLessons.js";
import videoLessonRoutes from "./routes/videoLessons.js";
import blockLessonRoutes from "./routes/blockLessons.js";
import scormLessonRoutes from "./routes/scormLessons.js";
import quizLessonRoutes from "./routes/quizLessons.js";
import assignmentLessonRoutes from "./routes/assignmentLessons.js";
import documentLessonRoutes from "./routes/documentLessons.js";
import settingsRoutes from "./routes/settings.js";
import categoriesRoutes from "./routes/categories.js";
import userRoutes from "./routes/users.js";
import teamRoutes from "./routes/teams.js";
import departmentRoutes from "./routes/departments.js";
import eventRoutes from "./routes/events.js";
import enrollmentRoutes from "./routes/enrollments.js";
import progressRoutes from "./routes/progress.js";
import scormRoutes from "./routes/scorm.js";
import instituteRoutes from "./routes/institutes.js";
import classroomRoutes from "./routes/classrooms.js";
import classroomManagementRoutes from "./routes/classroomManagement.js";
import teamMessageRoutes from "./routes/teamMessages.js";
import recordingRoutes from "./routes/recordings.js";
import certificateRoutes from "./routes/certificates.js";
import playlistRoutes from "./routes/playlists.js";
import dashboardRoutes from "./routes/dashboard.js";
import gamificationRoutes from "./routes/gamification.js";
import notificationRoutes from "./routes/notifications.js";
import instructorRequestRoutes from "./routes/instructorRequests.js";
import adminRequestRoutes from "./routes/adminRequests.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
console.log("Registering routes...");
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/text-lessons", textLessonRoutes);
app.use("/api/video-lessons", videoLessonRoutes);
app.use("/api/block-lessons", blockLessonRoutes);
app.use("/api/scorm-lessons", scormLessonRoutes);
app.use("/api/quiz-lessons", quizLessonRoutes);
app.use("/api/assignment-lessons", assignmentLessonRoutes);
app.use("/api/document-lessons", documentLessonRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/scorm", scormRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/classroom-management", classroomManagementRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/team-messages", teamMessageRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/instructor-requests", instructorRequestRoutes);
app.use("/api/admin-requests", adminRequestRoutes);
console.log("All routes registered successfully");

// Serve uploaded files (keeping for backwards compatibility)
app.use("/uploads", express.static("uploads"));

// Root route
app.get("/", (req, res) => {
  res.send("Academiq LMS backend is live!");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize WebSocket signaling server
initializeSignalingServer(httpServer);
console.log('WebSocket signaling server initialized');

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      console.log('WebRTC signaling server ready');
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
