// models/index.js
// Import all models to ensure they are registered with Mongoose
// This prevents "Schema hasn't been registered" errors during populate operations

import User from "./User.js";
import Course from "./Course.js";
import Lesson from "./Lesson.js";
import Chapter from "./Chapter.js";
import Category from "./Category.js";
import Enrollment from "./Enrollment.js";
import Team from "./Team.js";
import Department from "./Department.js";
import Event from "./Event.js";
import TextLesson from "./TextLesson.js";
import VideoLesson from "./VideoLesson.js";
import BlockLesson from "./BlockLesson.js";
import ScormLesson from "./ScormLesson.js";
import QuizLesson from "./QuizLesson.js";
import AssignmentLesson from "./AssignmentLesson.js";
import DocumentLesson from "./DocumentLesson.js";
import Question from "./Question.js";
import SystemSettings from "./SystemSettings.js";
import Notification from "./Notification.js";
import InstructorRequest from "./InstructorRequest.js";

// Export all models for convenience
export {
  User,
  Course,
  Lesson,
  Chapter,
  Category,
  Enrollment,
  Team,
  Department,
  Event,
  TextLesson,
  VideoLesson,
  BlockLesson,
  ScormLesson,
  QuizLesson,
  AssignmentLesson,
  DocumentLesson,
  Question,
  SystemSettings,
  Notification,
  InstructorRequest,
};

// Log that models are loaded
console.log("All Mongoose models loaded and registered");
