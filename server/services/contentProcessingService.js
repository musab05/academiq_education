import axios from 'axios';
import LessonContent from '../models/LessonContent.js';

const CHATBOT_URL = process.env.CHATBOT_URL || 'http://localhost:8000';

export const processLessonContent = async (lessonId, courseId, lessonType, content) => {
  try {
    let textToProcess = '';
    let videoUrl = null;
    let documentPaths = [];

    if (lessonType === 'text') {
      textToProcess = content.sections?.map(s => s.content).join('\n\n') || content.content || '';
    } else if (lessonType === 'video') {
      videoUrl = content.videoUrl || '';
      // Don't set textToProcess here - let chatbot extract from video
      textToProcess = '';
    } else if (lessonType === 'document') {
      documentPaths = content.documents?.map(doc => doc.filePath) || [];
      textToProcess = `Document lesson: ${content.title || ''}`;
    } else if (lessonType === 'blocks') {
      textToProcess = content.blocks?.map(block => {
        if (block.type === 'paragraph') return block.data?.text || '';
        if (block.type === 'header') return block.data?.text || '';
        if (block.type === 'list') return block.data?.items?.join(' ') || '';
        return '';
      }).join(' ') || '';
    }

    // Allow processing if we have video URL or document paths even without text
    if (!textToProcess.trim() && !videoUrl && documentPaths.length === 0) {
      console.log(`Skipping content processing for lesson ${lessonId} - no content to process`);
      return null;
    }

    const response = await axios.post(`${CHATBOT_URL}/api/process-content`, {
      text: textToProcess,
      lessonId,
      courseId,
      lessonType,
      videoUrl,
      documentPaths
    }, { timeout: 60000 }); // Increased timeout for video processing

    const Course = (await import('../models/Course.js')).default;
    const course = await Course.findById(courseId).select('title description');

    await LessonContent.findOneAndUpdate(
      { lesson: lessonId },
      {
        lesson: lessonId,
        course: courseId,
        courseTitle: course?.title || '',
        courseDescription: course?.description || '',
        processedText: response.data.processedText,
        lessonType,
        metadata: response.data.metadata || {}
      },
      { upsert: true, new: true }
    );

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
      console.log(`Chatbot service unavailable - skipping content processing for lesson ${lessonId}`);
    } else {
      console.error('Error processing lesson content:', error.message);
    }
    return null;
  }
};
