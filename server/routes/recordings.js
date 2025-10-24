import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import * as recordingController from '../controllers/recordingController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/recordings/');
  },
  filename: (req, file, cb) => {
    cb(null, `recording-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

router.post('/upload', authenticate, upload.single('recording'), recordingController.uploadRecording);
router.get('/', recordingController.getRecordings);
router.get('/classroom/:classroomId', recordingController.getRecordingsByClassroom);
router.delete('/:id', authenticate, recordingController.deleteRecording);
router.get('/watch/:id', recordingController.watchRecording);
router.get('/download/:id', recordingController.downloadRecording);

export default router;
