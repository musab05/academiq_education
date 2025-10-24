/**
 * SCORM Helper Utilities
 * Provides SCORM 1.2 API implementation for client-side integration
 */

export class ScormAPI {
  constructor(lessonId, apiClient) {
    this.lessonId = lessonId;
    this.apiClient = apiClient;
    this.initialized = false;
    this.sessionId = null;
    this.cmiData = {};
    this.errorCode = '0';
    this.errorString = '';
  }

  // SCORM API Methods
  LMSInitialize(parameter) {
    if (parameter !== '') {
      this.setError('201', 'Invalid argument');
      return 'false';
    }

    if (this.initialized) {
      this.setError('101', 'Already initialized');
      return 'false';
    }

    try {
      // Initialize session with backend
      this.apiClient.initializeScormSession(this.lessonId)
        .then(response => {
          this.sessionId = response.data.sessionId;
          this.cmiData = response.data.cmiData;
          this.initialized = true;
        });
      
      return 'true';
    } catch (error) {
      this.setError('101', 'General initialization failure');
      return 'false';
    }
  }

  LMSFinish(parameter) {
    if (parameter !== '') {
      this.setError('201', 'Invalid argument');
      return 'false';
    }

    if (!this.initialized) {
      this.setError('301', 'Not initialized');
      return 'false';
    }

    try {
      // Commit data to backend
      this.apiClient.commitScormData(this.lessonId);
      this.initialized = false;
      return 'true';
    } catch (error) {
      this.setError('101', 'General termination failure');
      return 'false';
    }
  }

  LMSGetValue(element) {
    if (!this.initialized) {
      this.setError('301', 'Not initialized');
      return '';
    }

    if (!this.isValidElement(element)) {
      this.setError('201', 'Invalid argument');
      return '';
    }

    try {
      // Return cached value for synchronous operation
      return this.cmiData[element] || '';
    } catch (error) {
      this.setError('101', 'General get failure');
      return '';
    }
  }

  LMSSetValue(element, value) {
    if (!this.initialized) {
      this.setError('301', 'Not initialized');
      return 'false';
    }

    if (!this.isValidElement(element)) {
      this.setError('201', 'Invalid argument');
      return 'false';
    }

    if (!this.isValidValue(element, value)) {
      this.setError('405', 'Incorrect data type');
      return 'false';
    }

    try {
      // Update local cache
      this.cmiData[element] = value;
      
      // Send to backend
      this.apiClient.setScormCMIValue(this.lessonId, element, value);
      
      return 'true';
    } catch (error) {
      this.setError('101', 'General set failure');
      return 'false';
    }
  }

  LMSCommit(parameter) {
    if (parameter !== '') {
      this.setError('201', 'Invalid argument');
      return 'false';
    }

    if (!this.initialized) {
      this.setError('301', 'Not initialized');
      return 'false';
    }

    try {
      this.apiClient.commitScormData(this.lessonId);
      return 'true';
    } catch (error) {
      this.setError('101', 'General commit failure');
      return 'false';
    }
  }

  LMSGetLastError() {
    return this.errorCode;
  }

  LMSGetErrorString(errorCode) {
    const errorStrings = {
      '0': 'No error',
      '101': 'General exception',
      '201': 'Invalid argument error',
      '301': 'Not initialized',
      '405': 'Incorrect data type'
    };
    
    return errorStrings[errorCode] || 'Unknown error';
  }

  LMSGetDiagnostic(errorCode) {
    return this.LMSGetErrorString(errorCode);
  }

  // Helper methods
  setError(code, message) {
    this.errorCode = code;
    this.errorString = message;
  }

  isValidElement(element) {
    const validElements = [
      // Core status
      'cmi.core.lesson_status',
      'cmi.core.completion_status', 
      'cmi.core.success_status',
      
      // Score elements
      'cmi.core.score.raw',
      'cmi.core.score.min',
      'cmi.core.score.max',
      'cmi.core.score.scaled',
      
      // Navigation
      'cmi.core.lesson_location',
      'cmi.suspend_data',
      
      // Time
      'cmi.core.session_time',
      'cmi.core.total_time',
      
      // Entry/Exit
      'cmi.core.entry',
      'cmi.core.exit',
      'cmi.core.credit',
      
      // Data
      'cmi.launch_data',
      'cmi.comments_from_learner',
      'cmi.comments_from_lms',
      
      // Interactions (with array notation)
      'cmi.interactions._count',
      
      // Objectives (with array notation)
      'cmi.objectives._count'
    ];
    
    // Check for array elements like cmi.interactions.0.id
    const arrayPatterns = [
      /^cmi\.interactions\.(\d+)\.(id|type|result|student_response|timestamp|latency|description)$/,
      /^cmi\.objectives\.(\d+)\.(id|score\.raw|score\.min|score\.max|score\.scaled|status|description)$/
    ];
    
    return validElements.includes(element) || arrayPatterns.some(pattern => pattern.test(element));
  }

  isValidValue(element, value) {
    if (element === 'cmi.core.lesson_status') {
      return ['not attempted', 'incomplete', 'completed', 'passed', 'failed', 'browsed'].includes(value);
    }
    
    if (element === 'cmi.core.completion_status') {
      return ['completed', 'incomplete', 'not attempted', 'unknown'].includes(value);
    }
    
    if (element === 'cmi.core.success_status') {
      return ['passed', 'failed', 'unknown'].includes(value);
    }
    
    if (element === 'cmi.core.exit') {
      return ['time-out', 'suspend', 'logout', 'normal', ''].includes(value);
    }
    
    if (element === 'cmi.core.entry') {
      return ['ab-initio', 'resume', ''].includes(value);
    }
    
    if (element === 'cmi.core.credit') {
      return ['credit', 'no-credit'].includes(value);
    }
    
    if (element.includes('score.scaled')) {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 1;
    }
    
    if (element.includes('score')) {
      return !isNaN(parseFloat(value));
    }
    
    if (element.includes('interaction') && element.includes('type')) {
      return ['choice', 'true-false', 'fill-in', 'long-fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric', 'other'].includes(value);
    }
    
    if (element.includes('interaction') && element.includes('result')) {
      return ['correct', 'incorrect', 'unanticipated', 'neutral'].includes(value);
    }
    
    if (element.includes('objective') && element.includes('status')) {
      return ['passed', 'failed', 'completed', 'incomplete', 'browsed', 'not attempted'].includes(value);
    }
    
    return true;
  }
}

export const createScormAPI = (lessonId, apiClient) => {
  return new ScormAPI(lessonId, apiClient);
};

// Helper functions for SCORM content
export const ScormUtils = {
  // Add interaction to SCORM progress
  addInteraction: async (lessonId, interactionData, apiClient) => {
    try {
      await apiClient.addScormInteraction(lessonId, interactionData);
      return true;
    } catch (error) {
      console.error('Error adding interaction:', error);
      return false;
    }
  },
  
  // Set objective data
  setObjective: async (lessonId, objectiveData, apiClient) => {
    try {
      await apiClient.setScormObjective(lessonId, objectiveData);
      return true;
    } catch (error) {
      console.error('Error setting objective:', error);
      return false;
    }
  },
  
  // Format time to ISO 8601 duration
  formatDuration: (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `PT${hours}H${minutes}M${seconds}S`;
  },
  
  // Parse ISO 8601 duration to milliseconds
  parseDuration: (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
  }
};