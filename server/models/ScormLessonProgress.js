import mongoose from "mongoose";

const scormLessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
      required: true,
    },
    learnerId: String,
    learnerName: String,
    scoId: String,
    courseId: String,
    scormVersion: {
      type: String,
      enum: ['1.2', '2004'],
      default: '1.2'
    },
    cmiData: {
      type: Object,
      default: {}
    },
    attempts: [{
      attemptNo: Number,
      score: Number,
      lessonStatus: String,
      successStatus: String,
      completionStatus: String,
      sessionTime: String,
      startedAt: Date,
      completedAt: Date,
      suspendData: String,
      lessonLocation: String
    }],
    currentAttempt: {
      type: Number,
      default: 1
    },
    interactions: [{
      id: String,
      type: String,
      result: String,
      student_response: String,
      timestamp: Date,
      latency: String,
      description: String
    }],
    objectives: [{
      id: String,
      score: {
        raw: Number,
        min: Number,
        max: Number,
        scaled: Number
      },
      status: String,
      description: String
    }],
    sessionStartTime: Date,
    lastAccessTime: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

scormLessonProgressSchema.index({ user: 1, lesson: 1 });

// Helper method to get CMI value
scormLessonProgressSchema.methods.getCMIValue = function(element) {
  let value = this.cmiData[element];
  if (value === undefined || value === null) {
    value = this.getDefaultCMIValue(element);
  }
  return String(value || '');
};

// Helper method to get default CMI values
scormLessonProgressSchema.methods.getDefaultCMIValue = function(element) {
  const version = this.scormVersion || '1.2';
  
  if (version === '1.2') {
    const defaults = {
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.score.raw': '',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.core.session_time': '00:00:00',
      'cmi.core.total_time': '00:00:00',
      'cmi.core.student_name': this.learnerName || 'Student',
      'cmi.core.student_id': this.learnerId || 'student_1',
      'cmi.core.entry': 'ab-initio',
      'cmi.core.lesson_location': '',
      'cmi.core.credit': 'credit',
      'cmi.core.lesson_mode': 'normal',
      'cmi.core.exit': '',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.comments': '',
      'cmi.comments_from_lms': ''
    };
    return defaults[element] || '';
  } else {
    // SCORM 2004 defaults
    const defaults = {
      'cmi.completion_status': 'incomplete',
      'cmi.success_status': 'unknown',
      'cmi.score.raw': '',
      'cmi.score.min': '0',
      'cmi.score.max': '100',
      'cmi.score.scaled': '0',
      'cmi.progress_measure': '0',
      'cmi.session_time': 'PT0H0M0S',
      'cmi.total_time': 'PT0H0M0S',
      'cmi.learner_name': this.learnerName || 'Student',
      'cmi.learner_id': this.learnerId || 'student_1',
      'cmi.entry': 'ab-initio',
      'cmi.location': '',
      'cmi.credit': 'credit',
      'cmi.mode': 'normal',
      'cmi.exit': '',
      'cmi.suspend_data': '',
      'cmi.launch_data': ''
    };
    return defaults[element] || '';
  }
};

// Helper method to set CMI value
scormLessonProgressSchema.methods.setCMIValue = function(element, value) {
  // Don't allow changing status back to incomplete if already completed
  if (this.isCompleted && (element === 'cmi.core.lesson_status' || element === 'cmi.completion_status')) {
    if (!['completed', 'passed'].includes(value)) {
      return this.save();
    }
  }
  
  this.cmiData[element] = value;
  this.markModified('cmiData');
  this.lastAccessTime = new Date();
  
  // Check completion
  if (element === 'cmi.core.lesson_status' && ['completed', 'passed'].includes(value)) {
    this.isCompleted = true;
    if (!this.completedAt) this.completedAt = new Date();
    this.saveAttempt();
  } else if (element === 'cmi.completion_status' && value === 'completed') {
    this.isCompleted = true;
    if (!this.completedAt) this.completedAt = new Date();
    this.saveAttempt();
  }
  
  return this.save();
};

// Save current attempt
scormLessonProgressSchema.methods.saveAttempt = function() {
  const attempt = {
    attemptNo: this.currentAttempt,
    score: this.cmiData['cmi.core.score.raw'] || this.cmiData['cmi.score.raw'],
    lessonStatus: this.cmiData['cmi.core.lesson_status'],
    successStatus: this.cmiData['cmi.success_status'],
    completionStatus: this.cmiData['cmi.completion_status'],
    sessionTime: this.cmiData['cmi.core.session_time'] || this.cmiData['cmi.session_time'],
    startedAt: this.sessionStartTime,
    completedAt: new Date(),
    suspendData: this.cmiData['cmi.suspend_data'],
    lessonLocation: this.cmiData['cmi.core.lesson_location'] || this.cmiData['cmi.location']
  };
  
  const existingIndex = this.attempts.findIndex(a => a.attemptNo === this.currentAttempt);
  if (existingIndex >= 0) {
    this.attempts[existingIndex] = attempt;
  } else {
    this.attempts.push(attempt);
  }
};

// Helper method to add interaction
scormLessonProgressSchema.methods.addInteraction = function(interactionData) {
  this.interactions.push({
    id: interactionData.id,
    type: interactionData.type,
    result: interactionData.result,
    student_response: interactionData.student_response,
    timestamp: new Date(),
    latency: interactionData.latency || '',
    description: interactionData.description || ''
  });
  return this.save();
};

// Helper method to add/update objective
scormLessonProgressSchema.methods.setObjective = function(objectiveData) {
  const existingIndex = this.objectives.findIndex(obj => obj.id === objectiveData.id);
  
  if (existingIndex >= 0) {
    this.objectives[existingIndex] = { ...this.objectives[existingIndex], ...objectiveData };
  } else {
    this.objectives.push(objectiveData);
  }
  
  return this.save();
};

// Helper method to format time to ISO 8601 duration
scormLessonProgressSchema.methods.formatDuration = function(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `PT${hours}H${minutes}M${seconds}S`;
};

// Helper method to parse ISO 8601 duration
scormLessonProgressSchema.methods.parseDuration = function(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
};

// Helper method to check completion status for both SCORM versions
scormLessonProgressSchema.methods.checkCompletion = function() {
  // Check SCORM 1.2 completion
  const scorm12Status = this.cmiData['cmi.core.lesson_status'];
  if (scorm12Status && ['completed', 'passed'].includes(scorm12Status)) {
    return true;
  }
  
  // Check SCORM 2004 completion
  const completionStatus = this.cmiData['cmi.completion_status'];
  const successStatus = this.cmiData['cmi.success_status'];
  
  if (completionStatus === 'completed' || successStatus === 'passed') {
    return true;
  }
  
  return false;
};

// Pre-save hook to update completion status
scormLessonProgressSchema.pre('save', function(next) {
  const wasCompleted = this.isCompleted;
  this.isCompleted = this.checkCompletion();
  
  if (this.isCompleted && !wasCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

export default mongoose.model("ScormLessonProgress", scormLessonProgressSchema);
