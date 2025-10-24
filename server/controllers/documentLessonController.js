import Lesson from '../models/Lesson.js';
import DocumentLesson from '../models/DocumentLesson.js';
import DocumentLessonProgress from '../models/DocumentLessonProgress.js';
import Progress from '../models/Progress.js';

export const getDocumentLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await DocumentLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateDocumentLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const documentData = {
      lesson: lessonId,
      documents: updateData.documents || [],
      viewerSettings: updateData.viewerSettings || {
        allowPrint: true,
        allowCopy: true,
        watermark: ''
      },
      isDraft: updateData.isDraft || false
    };

    const activity = await DocumentLesson.findOneAndUpdate(
      { lesson: lessonId },
      documentData,
      { new: true, upsert: true }
    );

    res.json(activity);
  } catch (error) {
    console.error('Error updating document lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const markDocumentViewed = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let progress = await Progress.findOne({ user: userId, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({ user: userId, course: lesson.course, progress: 0, status: 'not_started' });
    }

    let documentProgress = await DocumentLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!documentProgress) {
      documentProgress = await DocumentLessonProgress.create({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessTime: new Date()
      });
    } else {
      documentProgress.lastAccessTime = new Date();
      if (!documentProgress.isCompleted) {
        documentProgress.isCompleted = true;
        documentProgress.completedAt = new Date();
      }
      await documentProgress.save();
    }

    res.json({ success: true, progress: documentProgress });
  } catch (error) {
    console.error('Error marking document viewed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDocumentProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const documentProgress = await DocumentLessonProgress.findOne({ user: userId, lesson: lessonId });
    res.json(documentProgress || { isCompleted: false });
  } catch (error) {
    console.error('Error fetching document progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};