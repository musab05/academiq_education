import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { saveTemplate, getTemplate } from '../controllers/certificateController.js';
import Course from '../models/Course.js';
import { generateCertificate } from '../utils/certificateGenerator.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, `certificate-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

const router = express.Router();

router.post('/template', authenticate, upload.single('templateImage'), saveTemplate);
router.get('/template', authenticate, getTemplate);
router.get('/download/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('certificateTemplate');
    
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ error: "Course not found" });
    }
    
    if (!course.certificateEnabled) {
      console.log('Certificate not enabled for course:', courseId);
      return res.status(404).json({ error: "Certificate not enabled" });
    }
    
    if (!course.certificateTemplate) {
      console.log('No certificate template assigned to course:', courseId);
      return res.status(404).json({ error: "No certificate template assigned" });
    }

    const userData = {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      courseTitle: course.title,
      completionDate: new Date()
    };

    const certificateBuffer = await generateCertificate(course.certificateTemplate, userData);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${course.title.replace(/\s+/g, '-')}.png"`);
    res.send(certificateBuffer);
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: "Failed to generate certificate", details: error.message });
  }
});

export default router;
