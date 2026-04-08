import Lesson from "../models/Lesson.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import TextLesson from "../models/TextLesson.js";
import VideoLesson from "../models/VideoLesson.js";
import QuizLesson from "../models/QuizLesson.js";
import AssignmentLesson from "../models/AssignmentLesson.js";
import DocumentLesson from "../models/DocumentLesson.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "attachments");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// Create default activity for lesson
const createDefaultActivity = async (lesson) => {
  try {
    switch (lesson.type) {
      case "text":
        await TextLesson.create({
          lesson: lesson._id,
          sections: [
            {
              type: "paragraph",
              content: "Start writing your lesson content here...",
              order: 0,
            },
          ],
        });
        break;
      case "video":
        await VideoLesson.create({
          lesson: lesson._id,
          videoUrl: "",
          duration: 0,
        });
        break;
      case "quiz":
        await QuizLesson.create({
          lesson: lesson._id,
          questions: [],
        });
        break;
      case "assignment":
        await AssignmentLesson.create({
          lesson: lesson._id,
          instructions: "Assignment instructions...",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        });
        break;
      case "document":
        await DocumentLesson.create({
          lesson: lesson._id,
          documents: [],
        });
        break;
    }
  } catch (error) {
    console.error("Error creating default activity:", error);
  }
};

export const getLessonsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("slug");
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Allow access for course author, admin, superadmin, or any authenticated user (for preview)
    // Students can view lessons for preview purposes
    // Sort lessons and chapters by order field
    const lessons = await Lesson.find({ course: courseId })
      .populate("chapter")
      .sort({ order: 1 });
    const chapters = await Chapter.find({ course: courseId }).sort({
      order: 1,
    });

    res.json({ lessons, chapters, course: { slug: course.slug } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { title, type, courseId, chapterId } = req.body;

    if (!title?.trim() || !type || !courseId) {
      return res
        .status(400)
        .json({ error: "Title, type, and course ID are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get max order from existing lessons and chapters
    const maxLessonOrder = await Lesson.findOne({ course: courseId })
      .sort("-order")
      .select("order");
    const maxChapterOrder = await Chapter.findOne({ course: courseId })
      .sort("-order")
      .select("order");
    const maxOrder = Math.max(
      maxLessonOrder?.order || -1,
      maxChapterOrder?.order || -1,
    );

    const lesson = new Lesson({
      title: title.trim(),
      type,
      course: courseId,
      chapter: chapterId || null,
      order: maxOrder + 1,
    });

    await lesson.save();
    await lesson.populate("chapter");

    // Create default activity for the lesson
    await createDefaultActivity(lesson);

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createChapter = async (req, res) => {
  try {
    const { title, courseId } = req.body;

    if (!title?.trim() || !courseId) {
      return res
        .status(400)
        .json({ error: "Title and course ID are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get max order from existing lessons and chapters
    const maxLessonOrder = await Lesson.findOne({ course: courseId })
      .sort("-order")
      .select("order");
    const maxChapterOrder = await Chapter.findOne({ course: courseId })
      .sort("-order")
      .select("order");
    const maxOrder = Math.max(
      maxLessonOrder?.order || -1,
      maxChapterOrder?.order || -1,
    );

    const chapter = new Chapter({
      title: title.trim(),
      course: courseId,
      order: maxOrder + 1,
    });

    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { title } = req.body;
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      lesson.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    lesson.title = title.trim();
    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { title } = req.body;
    const chapter = await Chapter.findById(req.params.id).populate("course");

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      chapter.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    chapter.title = title.trim();
    await chapter.save();
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      lesson.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete associated LessonContent
    const LessonContent = (await import("../models/LessonContent.js")).default;
    await LessonContent.deleteMany({ lesson: req.params.id });

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: "Lesson deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("course");

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Allow access for course author, admin, or superadmin
    if (
      chapter.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: "Chapter deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    if (
      lesson.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const attachment = {
      fileName: req.file.originalname,
      filePath: `/uploads/attachments/${req.file.filename}`,
      fileSize: req.file.size,
    };

    lesson.attachments.push(attachment);
    await lesson.save();

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const lesson = await Lesson.findById(id).populate("course");

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    if (
      lesson.course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const attachment = lesson.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const filePath = path.join(process.cwd(), attachment.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    lesson.attachments.pull(attachmentId);
    await lesson.save();

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const reorderItems = async (req, res) => {
  try {
    const { courseId, items } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (
      course.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = items.map(({ id, type, order }) => {
      const Model = type === "chapter" ? Chapter : Lesson;
      return Model.findByIdAndUpdate(id, { order });
    });

    await Promise.all(updates);
    res.json({ message: "Order updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
