class ScormWrapper {
  constructor() {
    this.version = null;
    this.apiHandle = null;
    this.data = {};
    this.initialized = false;
    this.onProgressUpdate = null;
    this.onCompleted = null;
  }

  // Find and initialize the appropriate SCORM API
  initialize() {
    this.apiHandle = this.findAPI();
    if (this.apiHandle) {
      this.version = this.detectVersion();
      this.setupAPI();
      return this.callInitialize();
    }
    return false;
  }

  // Find SCORM API in the window hierarchy
  findAPI() {
    let api = null;
    let win = window;
    let attempts = 0;
    const maxAttempts = 500;

    // Look for SCORM 2004 API first
    while (!api && win && attempts < maxAttempts) {
      try {
        if (win.API_1484_11) {
          api = win.API_1484_11;
          break;
        }
        if (win.parent && win.parent !== win) {
          win = win.parent;
        } else {
          break;
        }
      } catch (e) {
        break;
      }
      attempts++;
    }

    // If not found, look for SCORM 1.2 API
    if (!api) {
      win = window;
      attempts = 0;
      while (!api && win && attempts < maxAttempts) {
        try {
          if (win.API) {
            api = win.API;
            break;
          }
          if (win.parent && win.parent !== win) {
            win = win.parent;
          } else {
            break;
          }
        } catch (e) {
          break;
        }
        attempts++;
      }
    }

    return api;
  }

  // Detect SCORM version based on API methods
  detectVersion() {
    if (!this.apiHandle) return null;
    
    if (this.apiHandle.Initialize) {
      return '2004';
    } else if (this.apiHandle.LMSInitialize) {
      return '1.2';
    }
    return null;
  }

  // Setup API based on version
  setupAPI() {
    if (this.version === '2004') {
      this.methods = {
        initialize: 'Initialize',
        terminate: 'Terminate',
        getValue: 'GetValue',
        setValue: 'SetValue',
        commit: 'Commit',
        getLastError: 'GetLastError',
        getErrorString: 'GetErrorString',
        getDiagnostic: 'GetDiagnostic'
      };
      this.dataModel = this.getScorm2004DataModel();
    } else if (this.version === '1.2') {
      this.methods = {
        initialize: 'LMSInitialize',
        terminate: 'LMSFinish',
        getValue: 'LMSGetValue',
        setValue: 'LMSSetValue',
        commit: 'LMSCommit',
        getLastError: 'LMSGetLastError',
        getErrorString: 'LMSGetErrorString',
        getDiagnostic: 'LMSGetDiagnostic'
      };
      this.dataModel = this.getScorm12DataModel();
    }
  }

  // SCORM 1.2 Data Model
  getScorm12DataModel() {
    return {
      lessonStatus: 'cmi.core.lesson_status',
      score: 'cmi.core.score.raw',
      scoreMin: 'cmi.core.score.min',
      scoreMax: 'cmi.core.score.max',
      sessionTime: 'cmi.core.session_time',
      totalTime: 'cmi.core.total_time',
      suspendData: 'cmi.suspend_data',
      location: 'cmi.core.lesson_location',
      studentName: 'cmi.core.student_name',
      studentId: 'cmi.core.student_id',
      entry: 'cmi.core.entry',
      exit: 'cmi.core.exit',
      interactions: 'cmi.interactions'
    };
  }

  // SCORM 2004 Data Model
  getScorm2004DataModel() {
    return {
      completionStatus: 'cmi.completion_status',
      successStatus: 'cmi.success_status',
      score: 'cmi.score.raw',
      scoreMin: 'cmi.score.min',
      scoreMax: 'cmi.score.max',
      progressMeasure: 'cmi.progress_measure',
      sessionTime: 'cmi.session_time',
      totalTime: 'cmi.total_time',
      suspendData: 'cmi.suspend_data',
      location: 'cmi.location',
      learnerName: 'cmi.learner_name',
      learnerId: 'cmi.learner_id',
      entry: 'cmi.entry',
      exit: 'cmi.exit',
      interactions: 'cmi.interactions'
    };
  }

  // Call appropriate initialize method
  callInitialize() {
    try {
      const result = this.apiHandle[this.methods.initialize]('');
      this.initialized = (result === 'true' || result === true);
      if (this.initialized) {
        this.loadExistingData();
      }
      return this.initialized;
    } catch (e) {
      console.error('SCORM Initialize failed:', e);
      return false;
    }
  }

  // Load existing data from LMS
  loadExistingData() {
    Object.values(this.dataModel).forEach(element => {
      try {
        const value = this.getValue(element);
        if (value) {
          this.data[element] = value;
        }
      } catch (e) {
        // Ignore errors for optional elements
      }
    });
  }

  // Get value from SCORM API
  getValue(element) {
    if (!this.initialized || !this.apiHandle) return '';
    try {
      return this.apiHandle[this.methods.getValue](element) || '';
    } catch (e) {
      console.error('SCORM GetValue failed:', e);
      return '';
    }
  }

  // Set value in SCORM API
  setValue(element, value) {
    if (!this.initialized || !this.apiHandle) return false;
    try {
      this.data[element] = value;
      const result = this.apiHandle[this.methods.setValue](element, value);
      
      // Trigger progress update callbacks
      this.handleDataChange(element, value);
      
      return result === 'true' || result === true;
    } catch (e) {
      console.error('SCORM SetValue failed:', e);
      return false;
    }
  }

  // Handle data changes and trigger callbacks
  handleDataChange(element, value) {
    // Check for completion
    const isCompleted = this.checkCompletion();
    if (isCompleted && this.onCompleted) {
      this.onCompleted();
    }

    // Calculate progress
    const progress = this.calculateProgress();
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        element,
        value,
        progress,
        isCompleted,
        data: this.data
      });
    }
  }

  // Check if lesson is completed
  checkCompletion() {
    if (this.version === '1.2') {
      const status = this.data[this.dataModel.lessonStatus];
      return status === 'completed' || status === 'passed';
    } else if (this.version === '2004') {
      const completion = this.data[this.dataModel.completionStatus];
      const success = this.data[this.dataModel.successStatus];
      return completion === 'completed' || success === 'passed';
    }
    return false;
  }

  // Calculate progress percentage
  calculateProgress() {
    if (this.version === '2004') {
      const progressMeasure = parseFloat(this.data[this.dataModel.progressMeasure] || 0);
      if (progressMeasure > 0) {
        return progressMeasure * 100;
      }
    }

    // Fallback: use score or completion status
    const score = parseFloat(this.data[this.dataModel.score] || 0);
    if (score > 0) {
      const maxScore = parseFloat(this.data[this.dataModel.scoreMax] || 100);
      return (score / maxScore) * 100;
    }

    // Final fallback: binary completion
    return this.checkCompletion() ? 100 : 0;
  }

  // Commit data to LMS
  commit() {
    if (!this.initialized || !this.apiHandle) return false;
    try {
      const result = this.apiHandle[this.methods.commit]('');
      return result === 'true' || result === true;
    } catch (e) {
      console.error('SCORM Commit failed:', e);
      return false;
    }
  }

  // Terminate SCORM session
  terminate() {
    if (!this.initialized || !this.apiHandle) return false;
    try {
      const result = this.apiHandle[this.methods.terminate]('');
      this.initialized = false;
      return result === 'true' || result === true;
    } catch (e) {
      console.error('SCORM Terminate failed:', e);
      return false;
    }
  }

  // Get all current data in normalized format
  getNormalizedData() {
    const normalized = {
      version: this.version,
      completionStatus: 'incomplete',
      successStatus: 'unknown',
      score: '0',
      progressMeasure: '0',
      sessionTime: this.version === '1.2' ? '00:00:00' : 'PT0H0M0S',
      suspendData: '',
      location: '',
      isCompleted: false
    };

    if (this.version === '1.2') {
      normalized.completionStatus = this.data[this.dataModel.lessonStatus] || 'incomplete';
      normalized.successStatus = this.data[this.dataModel.lessonStatus] === 'passed' ? 'passed' : 'unknown';
      normalized.score = this.data[this.dataModel.score] || '0';
      normalized.sessionTime = this.data[this.dataModel.sessionTime] || '00:00:00';
      normalized.suspendData = this.data[this.dataModel.suspendData] || '';
      normalized.location = this.data[this.dataModel.location] || '';
    } else if (this.version === '2004') {
      normalized.completionStatus = this.data[this.dataModel.completionStatus] || 'incomplete';
      normalized.successStatus = this.data[this.dataModel.successStatus] || 'unknown';
      normalized.score = this.data[this.dataModel.score] || '0';
      normalized.progressMeasure = this.data[this.dataModel.progressMeasure] || '0';
      normalized.sessionTime = this.data[this.dataModel.sessionTime] || 'PT0H0M0S';
      normalized.suspendData = this.data[this.dataModel.suspendData] || '';
      normalized.location = this.data[this.dataModel.location] || '';
    }

    normalized.isCompleted = this.checkCompletion();
    return normalized;
  }

  // Set callbacks
  setCallbacks({ onProgressUpdate, onCompleted }) {
    this.onProgressUpdate = onProgressUpdate;
    this.onCompleted = onCompleted;
  }
}

export default ScormWrapper;
