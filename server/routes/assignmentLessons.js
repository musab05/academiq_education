import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAssignmentLesson, updateAssignmentLesson, submitAssignment, getAssignmentProgress } from '../controllers/assignmentLessonController.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import AssignmentLesson from '../models/AssignmentLesson.js';

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
    const submissionsWithMax = submissions.map(sub => ({
      _id: sub._id,
      user: sub.user,
      fileName: sub.submittedFile,
      fileUrl: sub.submittedFile,
      submittedAt: sub.submittedAt,
      status: sub.isCompleted ? 'submitted' : 'pending',
      marks: sub.marks,
      maxMarks: assignment?.maxPoints || 100,
      feedback: sub.feedback
    }));
    
    res.json(submissionsWithMax);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:lessonId/submissions/:submissionId/grade', authenticate, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;
    const AssignmentLessonProgress = (await import('../models/AssignmentLessonProgress.js')).default;
    
    const submission = await AssignmentLessonProgress.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    submission.marks = marks;
    submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    await submission.save();
    
    res.json(submission);
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;