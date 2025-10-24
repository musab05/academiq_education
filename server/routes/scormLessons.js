import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getScormLesson, updateScormLesson, getCMIValue, setCMIValue, commitScormData, getScormActivity } from '../controllers/scormLessonController.js';
import Lesson from '../models/Lesson.js';
import ScormLesson from '../models/ScormLesson.js';

const router = express.Router();

// Get SCORM lesson activity
router.get('/:lessonId', authenticate, getScormActivity);

// SCORM API endpoints
router.get('/:lessonId/cmi', authenticate, getCMIValue);
router.post('/:lessonId/cmi', authenticate, setCMIValue);
router.post('/:lessonId/commit', authenticate, commitScormData);

// Update SCORM lesson activity with custom logic
router.put('/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Clean SCORM data structure
    const scormData = {
      lesson: lessonId,
      packageUrl: updateData.packageUrl || '',
      version: updateData.version || '1.2',
      title: updateData.title || '',
      description: updateData.description || '',
      launchUrl: updateData.launchUrl || '',
      manifest: updateData.manifest || {}
    };
    
    // Add version-specific data only if it exists and is properly structured
    if (updateData.version === '1.2' && updateData.scorm12) {
      scormData.scorm12 = {
        organizations: Array.isArray(updateData.scorm12.organizations) ? updateData.scorm12.organizations : [],
        resources: Array.isArray(updateData.scorm12.resources) ? updateData.scorm12.resources : []
      };
    }
    
    if (updateData.version === '2004' && updateData.scorm2004) {
      scormData.scorm2004 = {
        organizations: Array.isArray(updateData.scorm2004.organizations) ? updateData.scorm2004.organizations : [],
        resources: Array.isArray(updateData.scorm2004.resources) ? updateData.scorm2004.resources : [],
        sequencingCollection: updateData.scorm2004.sequencingCollection || null,
        navigationInterface: updateData.scorm2004.navigationInterface || null
      };
    }
    
    const activity = await ScormLesson.findOneAndUpdate(
      { lesson: lessonId },
      scormData,
      { new: true, upsert: true }
    );

    res.json(activity);
  } catch (error) {
    console.error('Error updating SCORM lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;