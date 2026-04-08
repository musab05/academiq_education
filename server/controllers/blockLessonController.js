import Lesson from "../models/Lesson.js";
import BlockLesson from "../models/BlockLesson.js";
import BlockLessonProgress from "../models/BlockLessonProgress.js";
import Progress from "../models/Progress.js";
import { processLessonContent } from "../services/contentProcessingService.js";
import { syncEnrollmentProgress } from "../utils/progressSync.js";

export const getBlockLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const activity = await BlockLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateBlockLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const activity = await BlockLesson.findOneAndUpdate(
      { lesson: lessonId },
      updateData,
      { new: true, upsert: true },
    );

    processLessonContent(
      lessonId,
      lesson.course._id,
      "block",
      updateData,
    ).catch((err) =>
      console.error("Background content processing failed:", err),
    );

    res.json(activity);
  } catch (error) {
    console.error("Error updating block lesson:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const updateBlockLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { completedBlocks } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Get block lesson to count total blocks
    const blockLesson = await BlockLesson.findOne({ lesson: lessonId });
    const totalBlocks = blockLesson?.blocks?.length || 0;

    // Find or create Progress record
    let progress = await Progress.findOne({
      user: userId,
      course: lesson.course,
    });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: lesson.course,
        progress: 0,
        status: "not_started",
      });
    }

    // Calculate completion based on blocks completed
    const completedCount = completedBlocks?.length || 0;
    const isCompleted = totalBlocks > 0 && completedCount >= totalBlocks;

    let blockProgress = await BlockLessonProgress.findOne({
      user: userId,
      lesson: lessonId,
    });

    if (!blockProgress) {
      blockProgress = await BlockLessonProgress.create({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        completedBlocks: completedBlocks || [],
        isCompleted,
        ...(isCompleted && { completedAt: new Date() }),
      });
    } else {
      blockProgress = await BlockLessonProgress.findOneAndUpdate(
        { user: userId, lesson: lessonId },
        {
          $set: {
            completedBlocks: completedBlocks || [],
            isCompleted,
            ...(isCompleted &&
              !blockProgress.isCompleted && { completedAt: new Date() }),
          },
        },
        { new: true },
      );
    }

    await updateCourseProgress(userId, lesson.course);
    await syncEnrollmentProgress(userId, lesson.course);

    res.json(blockProgress);
  } catch (error) {
    console.error("Error updating block lesson progress:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBlockLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const blockProgress = await BlockLessonProgress.findOne({
      user: userId,
      lesson: lessonId,
    });

    res.json(blockProgress || { isCompleted: false, completedBlocks: [] });
  } catch (error) {
    console.error("Error fetching block lesson progress:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCourseProgress = async (userId, courseId) => {
  try {
    const blockLessons = await Lesson.find({
      course: courseId,
      type: "blocks",
    }).select("_id");
    const blockLessonIds = blockLessons.map((l) => l._id);

    const completedCount = await BlockLessonProgress.countDocuments({
      user: userId,
      lesson: { $in: blockLessonIds },
      isCompleted: true,
    });

    const courseProgress =
      blockLessons.length > 0
        ? Math.round((completedCount / blockLessons.length) * 100)
        : 0;

    await Progress.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $set: {
          progress: courseProgress,
          status:
            courseProgress === 100
              ? "completed"
              : courseProgress > 0
                ? "in_progress"
                : "not_started",
          lastAccessed: new Date(),
        },
      },
      { upsert: true },
    );

    console.log(
      `Course ${courseId} block progress: ${courseProgress}% (${completedCount}/${blockLessons.length})`,
    );
  } catch (error) {
    console.error("Error updating course progress:", error);
  }
};
