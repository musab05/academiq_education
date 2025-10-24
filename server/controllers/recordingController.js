import Recording from '../models/Recording.js';
import ClassroomSession from '../models/ClassroomSession.js';
import path from 'path';
import fs from 'fs';

export const uploadRecording = async (req, res) => {
  try {
    const { sessionId, teamId, title, duration } = req.body;
    console.log('Upload recording request:', { sessionId, teamId, title, duration, fileSize: req.file?.size });
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const recordingData = {
      title: title || 'Meeting Recording',
      fileName: req.file.filename,
      filePath: `/uploads/recordings/${req.file.filename}`,
      fileSize: req.file.size,
      duration: parseInt(duration) || 0,
      recordedBy: req.user._id
    };

    if (sessionId) {
      const session = await ClassroomSession.findById(sessionId);
      if (!session) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Session not found' });
      }
      recordingData.session = sessionId;
      recordingData.classroom = session.classroom;
      recordingData.type = 'classroom';
    } else if (teamId) {
      recordingData.team = teamId;
      recordingData.type = 'team';
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Either sessionId or teamId is required' });
    }

    const recording = new Recording(recordingData);
    await recording.save();
    console.log('Recording saved to database:', recording._id);
    res.status(201).json(recording);
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecordings = async (req, res) => {
  try {
    const recordings = await Recording.find()
      .populate('session', 'title startTime')
      .populate('classroom', 'name')
      .populate('team', 'name')
      .populate('recordedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecordingsByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    console.log('Fetching recordings for classroom:', classroomId);
    
    const recordings = await Recording.find({ 
      $or: [{ classroom: classroomId }, { session: classroomId }] 
    })
      .populate('session', 'title startTime')
      .populate('recordedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    console.log('Found recordings:', recordings.length);
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const fullPath = path.join(process.cwd(), recording.filePath.replace(/^\/(uploads\/recordings\/)/, '$1'));
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await recording.deleteOne();
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const watchRecording = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const fullPath = path.join(process.cwd(), recording.filePath.replace(/^\/(uploads\/recordings\/)/, '$1'));
    
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return res.status(404).json({ message: 'File not found' });
    }

    const stat = fs.statSync(fullPath);
    res.writeHead(200, {
      'Content-Type': 'video/webm',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    console.error('Error streaming recording:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const downloadRecording = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const fullPath = path.join(process.cwd(), recording.filePath.replace(/^\/(uploads\/recordings\/)/, '$1'));
    
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(fullPath, recording.fileName);
  } catch (error) {
    console.error('Error downloading recording:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
