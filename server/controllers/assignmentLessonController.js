import fs from "fs";
import path from "path";
import Lesson from "../models/Lesson.js";
import AssignmentLesson from "../models/AssignmentLesson.js";
import AssignmentLessonProgress from "../models/AssignmentLessonProgress.js";
import Progress from "../models/Progress.js";
import { syncEnrollmentProgress } from '../utils/progressSync.js';

export const getAssignmentLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const activity = await AssignmentLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateAssignmentLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;

    console.log("=== Assignment Update Request ===");
    console.log("lessonId:", lessonId);
    console.log("Raw request body:", JSON.stringify(updateData, null, 2));
    console.log("typeof updateData:", typeof updateData);
    console.log("updateData.attachments type:", typeof updateData.attachments);
    console.log("updateData.attachments value:", updateData.attachments);

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Validate assignment before saving
    if (!updateData.isDraft) {
      if (!updateData.instructions || updateData.instructions.trim() === "") {
        return res
          .status(400)
          .json({ error: "Assignment instructions are required" });
      }
      if (!updateData.dueDate) {
        return res.status(400).json({ error: "Due date is required" });
      }
      if (new Date(updateData.dueDate) <= new Date()) {
        return res
          .status(400)
          .json({ error: "Due date must be in the future" });
      }
    }

    // Handle file attachments - now expecting URL references from uploaded files
    let attachments = [];
    console.log("Raw updateData.attachments:", updateData.attachments);
    console.log(
      "Type of updateData.attachments:",
      typeof updateData.attachments
    );
    console.log("Is Array:", Array.isArray(updateData.attachments));

    if (updateData.attachments) {
      // Handle case where attachments might be stringified
      let attachmentsData = updateData.attachments;
      if (typeof attachmentsData === "string") {
        try {
          attachmentsData = JSON.parse(attachmentsData);
          console.log("Parsed attachments from string:", attachmentsData);
        } catch (e) {
          console.error("Failed to parse attachments string:", e);
          attachmentsData = [];
        }
      }

      if (Array.isArray(attachmentsData)) {
        for (const attachment of attachmentsData) {
          // If attachment already has URL (from previous upload), keep it
          if (attachment.url && attachment.name) {
            attachments.push({
              name: attachment.name,
              url: attachment.url,
              size: attachment.size || 0,
              type: attachment.type || "application/octet-stream",
            });
          }
        }
      }
    }

    const assignmentData = {
      lesson: lessonId,
      instructions: updateData.instructions,
      dueDate: updateData.dueDate,
      maxPoints: updateData.maxPoints || 100,
      allowedFileTypes: updateData.allowedFileTypes || ["pdf", "doc", "docx"],
      maxFileSize: updateData.maxFileSize || 10,
      allowLateSubmission: updateData.allowLateSubmission || false,
      latePenalty: updateData.latePenalty || 10,
      groupAssignment: updateData.groupAssignment || false,
      maxGroupSize: updateData.maxGroupSize || 1,
      attachments: attachments,
      rubric: updateData.rubric || [],
    };

    console.log(
      "Final assignmentData.attachments:",
      assignmentData.attachments
    );
    console.log(
      "Type of final attachments:",
      typeof assignmentData.attachments
    );
    console.log(
      "Is final attachments array:",
      Array.isArray(assignmentData.attachments)
    );

    // Ensure attachments is always an array
    if (!Array.isArray(assignmentData.attachments)) {
      console.warn("Attachments is not an array, converting to empty array");
      assignmentData.attachments = [];
    }

    // AGGRESSIVE FIX: Delete any existing document for this lesson to avoid schema conflicts
    try {
      console.log(
        "Checking for existing document to clean up schema issues..."
      );
      const existingActivity = await AssignmentLesson.findOne({
        lesson: lessonId,
      });

      if (existingActivity) {
        console.log(
          "Found existing document, deleting to avoid schema conflicts"
        );
        await AssignmentLesson.deleteOne({ lesson: lessonId });
        console.log("Existing document deleted successfully");
      }
    } catch (error) {
      console.warn("Error during cleanup:", error.message);
    }

    // Create new document with clean schema
    const activity = new AssignmentLesson(assignmentData);
    const savedActivity = await activity.save();

    console.log(
      "Saved assignment activity:",
      JSON.stringify(savedActivity, null, 2)
    );
    res.json(savedActivity);
  } catch (error) {
    console.error("Error updating assignment lesson:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { submittedFile } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let progress = await Progress.findOne({ user: userId, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({ user: userId, course: lesson.course, progress: 0, status: 'not_started' });
    }

    let assignmentProgress = await AssignmentLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!assignmentProgress) {
      assignmentProgress = await AssignmentLessonProgress.create({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        submittedFile,
        submittedAt: new Date(),
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      assignmentProgress.submittedFile = submittedFile;
      assignmentProgress.submittedAt = new Date();
      assignmentProgress.isCompleted = true;
      if (!assignmentProgress.completedAt) assignmentProgress.completedAt = new Date();
      await assignmentProgress.save();
    }

    await syncEnrollmentProgress(userId, lesson.course);

    res.json({ success: true, progress: assignmentProgress });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAssignmentProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const assignmentProgress = await AssignmentLessonProgress.findOne({ user: userId, lesson: lessonId });
    res.json(assignmentProgress || { isCompleted: false });
  } catch (error) {
    console.error('Error fetching assignment progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
