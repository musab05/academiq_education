import Lesson from '../models/Lesson.js';
import QuizLesson from '../models/QuizLesson.js';
import Question from '../models/Question.js';
import QuizLessonProgress from '../models/QuizLessonProgress.js';
import Progress from '../models/Progress.js';
import { recordActivity } from '../services/activityService.js';
import { syncEnrollmentProgress } from '../utils/progressSync.js';

export const getQuizLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await QuizLesson.findOne({ lesson: lessonId }).populate('questions');
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const quizLesson = await QuizLesson.findOne({ lesson: lessonId }).populate('questions');
    if (!quizLesson) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let progress = await Progress.findOne({ user: userId, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({ user: userId, course: lesson.course, progress: 0, status: 'not_started' });
    }

    let quizProgress = await QuizLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!quizProgress) {
      quizProgress = await QuizLessonProgress.create({ user: userId, lesson: lessonId, progress: progress._id });
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = answers.map(answer => {
      const question = quizLesson.questions.find(q => q._id.toString() === answer.questionId);
      let isCorrect = false;
      
      if (question) {
        if (question.type === 'multi-select') {
          const userAnswers = Array.isArray(answer.selectedAnswer) ? answer.selectedAnswer : [];
          const correctIndices = question.correctAnswers.map(ans => question.options.indexOf(ans));
          isCorrect = correctIndices.length === userAnswers.length &&
            correctIndices.every(idx => userAnswers.includes(idx));
        } else if (question.type === 'fill-blank') {
          const userAnswer = String(answer.selectedAnswer).toLowerCase().trim();
          isCorrect = question.correctAnswers.some(ans => ans.toLowerCase().trim() === userAnswer);
        } else {
          const correctIndex = question.options.indexOf(question.correctAnswers[0]);
          isCorrect = correctIndex === answer.selectedAnswer;
        }
      }
      
      if (isCorrect) correctCount++;
      return { ...answer, isCorrect };
    });

    const score = Math.round((correctCount / quizLesson.questions.length) * 100);
    const passed = score >= quizLesson.passingScore;

    const attempt = {
      attemptNo: quizProgress.currentAttempt,
      score,
      answers: processedAnswers,
      startedAt: new Date(),
      completedAt: new Date(),
      passed
    };

    quizProgress.attempts.push(attempt);
    quizProgress.currentAttempt += 1;
    quizProgress.bestScore = Math.max(quizProgress.bestScore, score);
    quizProgress.lastAccessTime = new Date();

    if (passed) {
      quizProgress.isCompleted = true;
      if (!quizProgress.completedAt) quizProgress.completedAt = new Date();
    }

    await quizProgress.save();

    let activityResult = null;
    if (passed) {
      await updateCourseProgress(userId, lessonId);
      await syncEnrollmentProgress(userId, lesson.course);
      
      // Award XP for quiz completion with accuracy bonus
      try {
        activityResult = await recordActivity(
          userId,
          'complete_quiz',
          'quiz',
          lessonId,
          { courseId: lesson.course, accuracy: score }
        );
      } catch (activityError) {
        console.error('Error recording activity:', activityError);
      }
    }

    res.json({ score, passed, attempt, ...(activityResult || {}) });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getQuizProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const quizProgress = await QuizLessonProgress.findOne({ user: userId, lesson: lessonId });
    res.json(quizProgress || { attempts: [], bestScore: 0, isCompleted: false });
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCourseProgress = async (userId, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    const quizLessons = await Lesson.find({ course: lesson.course, type: 'quiz' }).select('_id');
    const quizLessonIds = quizLessons.map(l => l._id);
    
    const completedCount = await QuizLessonProgress.countDocuments({ 
      user: userId, 
      lesson: { $in: quizLessonIds },
      isCompleted: true 
    });

    const courseProgress = quizLessons.length > 0 ? Math.round((completedCount / quizLessons.length) * 100) : 0;
    
    await Progress.findOneAndUpdate(
      { user: userId, course: lesson.course },
      {
        $set: {
          progress: courseProgress,
          status: courseProgress === 100 ? 'completed' : courseProgress > 0 ? 'in_progress' : 'not_started',
          lastAccessed: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};

export const updateQuizLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let questionIds = [];
    if (updateData.questions && Array.isArray(updateData.questions)) {
      for (const questionData of updateData.questions) {
        // Validate question before saving
        if (!updateData.isDraft) {
          if (!questionData.question || questionData.question.trim() === '') {
            return res.status(400).json({ error: 'All questions must have text' });
          }

          if (questionData.type === 'single-select' || questionData.type === 'multi-select') {
            if (!questionData.options || questionData.options.length < 2) {
              return res.status(400).json({
                error: 'Multiple choice questions must have at least 2 options'
              });
            }
            if (questionData.options.some(opt => !opt || opt.trim() === '')) {
              return res.status(400).json({ error: 'All options must have text' });
            }
            if (!questionData.correctAnswers || questionData.correctAnswers.length === 0) {
              return res.status(400).json({
                error: 'Questions must have at least one correct answer selected'
              });
            }
          }

          if (questionData.type === 'true-false') {
            if (!questionData.correctAnswers || questionData.correctAnswers.length === 0) {
              return res.status(400).json({
                error: 'True/False questions must have a correct answer selected'
              });
            }
          }

          if (questionData.type === 'fill-blank') {
            if (!questionData.correctAnswers || !questionData.correctAnswers[0] || 
                questionData.correctAnswers[0].trim() === '') {
              return res.status(400).json({
                error: 'Fill in the blank questions must have a correct answer'
              });
            }
          }
        }

        if (questionData.id && !questionData._id) {
          const question = await Question.findOneAndUpdate(
            { frontendId: questionData.id },
            { ...questionData, frontendId: questionData.id },
            { new: true, upsert: true }
          );
          questionIds.push(question._id);
        } else if (questionData._id) {
          await Question.findByIdAndUpdate(questionData._id, questionData);
          questionIds.push(questionData._id);
        }
      }
    }

    const quizData = {
      lesson: lessonId,
      questions: questionIds,
      timeLimit: updateData.timeLimit,
      passingScore: updateData.passingScore,
      allowRetakes: updateData.allowRetakes,
      maxAttempts: updateData.maxAttempts,
      shuffleQuestions: updateData.shuffleQuestions,
      shuffleOptions: updateData.shuffleOptions,
      showResults: updateData.showResults
    };

    const activity = await QuizLesson.findOneAndUpdate(
      { lesson: lessonId },
      quizData,
      { new: true, upsert: true }
    ).populate('questions');

    res.json(activity);
  } catch (error) {
    console.error('Error updating quiz lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};