import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import { getAssignmentLesson, updateAssignmentLesson, submitAssignment, getAssignmentProgress } from '../controllers/assignmentLessonController.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import AssignmentLesson from '../models/AssignmentLesson.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get assignment lesson activity
router.get('/:lessonId', authenticate, getAssignmentLesson);

// Update assignment lesson activity
router.put('/:lessonId', authenticate, updateAssignmentLesson);

// Submit assignment
router.post('/:lessonId/submit', authenticate, submitAssignment);

// Get assignment progress
router.get('/:lessonId/progress', authenticate, getAssignmentProgress);

router.get('/:lessonId/submissions', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const AssignmentLessonProgress = (await import('../models/AssignmentLessonProgress.js')).default;
    
    const submissions = await AssignmentLessonProgress.find({ lesson: lessonId })
      .populate('user', 'firstName lastName email')
      .sort({ submittedAt: -1 });
    
    const assignment = await AssignmentLesson.findOne({ lesson: lessonId });
    const submissionsWithMax = submissions.map(sub => {
      console.log('Submission submittedFile:', sub.submittedFile);
      return {
        _id: sub._id,
        user: sub.user,
        fileName: sub.submittedFile,
        fileUrl: sub.submittedFile,
        submittedAt: sub.submittedAt,
        status: sub.isCompleted ? 'submitted' : 'pending',
        marks: sub.marks,
        maxMarks: assignment?.maxPoints || 100,
        feedback: sub.feedback
      };
    });
    
    res.json(submissionsWithMax);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:lessonId/submissions/:submissionId/grade', authenticate, async (req, res) => {
  try {
    const { lessonId, submissionId } = req.params;
    const { marks, feedback } = req.body;
    const AssignmentLessonProgress = (await import('../models/AssignmentLessonProgress.js')).default;
    const Lesson = (await import('../models/Lesson.js')).default;
    const Notification = (await import('../models/Notification.js')).default;
    
    const submission = await AssignmentLessonProgress.findById(submissionId).populate('user');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    
    submission.marks = marks;
    submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    await submission.save();
    
    // Send notification to student
    await Notification.create({
      recipient: submission.user._id,
      type: 'grade',
      title: 'Assignment Graded',
      message: `Your assignment "${lesson.title}" has been graded. Score: ${marks}`,
      link: `/learn/${lesson.course._id}`,
      metadata: {
        lessonId: lessonId,
        courseId: lesson.course._id
      }
    });
    
    res.json(submission);
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:lessonId/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const assignmentsDir = path.join(__dirname, '../uploads/assignments');
    
    // First try exact match
    let filePath = path.join(assignmentsDir, filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    
    // If not found, search for file ending with the requested filename
    const files = fs.readdirSync(assignmentsDir);
    const matchingFile = files.find(f => f.endsWith(filename));
    
    if (matchingFile) {
      filePath = path.join(assignmentsDir, matchingFile);
      return res.sendFile(filePath);
    }
    
    res.status(404).json({ error: 'File not found' });
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;