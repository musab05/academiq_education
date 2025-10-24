import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// SCORM launch endpoint
router.get('/launch/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Get SCORM lesson data
    const ScormLesson = (await import('../models/ScormLesson.js')).default;
    const scormLesson = await ScormLesson.findOne({ lesson: lessonId });
    
    if (!scormLesson || !scormLesson.packageUrl) {
      return res.status(404).send('SCORM package not found');
    }
    
    // Find the entry point file
    const fs = await import('fs');
    const path = await import('path');
    const packagePath = scormLesson.packageUrl.replace('http://localhost:3000/', '');
    const possibleEntryPoints = ['launch.html', 'index.html', 'index.htm', 'start.html', 'main.html'];
    
    let entryPoint = 'launch.html'; // default
    for (const entry of possibleEntryPoints) {
      const fullPath = path.join(packagePath, entry);
      if (fs.existsSync(fullPath)) {
        entryPoint = entry;
        break;
      }
    }
    
    // Get token from query parameter
    const token = req.query.token;
    
    // Return HTML wrapper with SCORM API that communicates with backend
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SCORM Content</title>
        <script>
          const authToken = '${token || ''}';
          const lessonId = '${lessonId}';
          let lastError = '0';
          let initialized = false;
          let terminated = false;
          
          // Error codes mapping
          const SCORM_ERRORS = {
            '0': 'No error',
            '101': 'General exception',
            '102': 'General initialization failure',
            '103': 'Already initialized',
            '104': 'Content instance terminated',
            '111': 'General termination failure',
            '112': 'Termination before initialization',
            '113': 'Termination after termination',
            '122': 'Retrieve data before initialization',
            '123': 'Retrieve data after termination',
            '132': 'Store data before initialization',
            '133': 'Store data after termination',
            '142': 'Commit before initialization',
            '143': 'Commit after termination',
            '201': 'General argument error',
            '301': 'General get failure',
            '351': 'General set failure',
            '391': 'General commit failure',
            '401': 'Undefined data model',
            '402': 'Unimplemented data model element',
            '403': 'Data model element value not initialized',
            '404': 'Data model element is read only',
            '405': 'Data model element is write only'
          };
          
          // Valid CMI elements for SCORM 1.2 and 2004
          const VALID_ELEMENTS = {
            // SCORM 1.2
            'cmi.core.student_id': 'r',
            'cmi.core.student_name': 'r',
            'cmi.core.lesson_location': 'rw',
            'cmi.core.credit': 'r',
            'cmi.core.lesson_status': 'rw',
            'cmi.core.entry': 'r',
            'cmi.core.score.raw': 'rw',
            'cmi.core.score.max': 'rw',
            'cmi.core.score.min': 'rw',
            'cmi.core.total_time': 'r',
            'cmi.core.lesson_mode': 'r',
            'cmi.core.exit': 'w',
            'cmi.core.session_time': 'w',
            'cmi.suspend_data': 'rw',
            'cmi.launch_data': 'r',
            'cmi.comments': 'rw',
            'cmi.comments_from_lms': 'r',
            'cmi.objectives._count': 'r',
            'cmi.student_data.mastery_score': 'r',
            'cmi.student_data.max_time_allowed': 'r',
            'cmi.student_data.time_limit_action': 'r',
            'cmi.student_preference.audio': 'rw',
            'cmi.student_preference.language': 'rw',
            'cmi.student_preference.speed': 'rw',
            'cmi.student_preference.text': 'rw',
            'cmi.interactions._count': 'r',
            // SCORM 2004
            'cmi.learner_id': 'r',
            'cmi.learner_name': 'r',
            'cmi.location': 'rw',
            'cmi.completion_status': 'rw',
            'cmi.completion_threshold': 'r',
            'cmi.credit': 'r',
            'cmi.entry': 'r',
            'cmi.exit': 'w',
            'cmi.launch_data': 'r',
            'cmi.learner_preference._children': 'r',
            'cmi.max_time_allowed': 'r',
            'cmi.mode': 'r',
            'cmi.objectives._children': 'r',
            'cmi.objectives._count': 'r',
            'cmi.progress_measure': 'rw',
            'cmi.scaled_passing_score': 'r',
            'cmi.score._children': 'r',
            'cmi.score.max': 'rw',
            'cmi.score.min': 'rw',
            'cmi.score.raw': 'rw',
            'cmi.score.scaled': 'rw',
            'cmi.session_time': 'w',
            'cmi.success_status': 'rw',
            'cmi.suspend_data': 'rw',
            'cmi.time_limit_action': 'r',
            'cmi.total_time': 'r',
            'adl.nav.request': 'rw'
          };
          
          function setError(errorCode) {
            lastError = errorCode;
            return errorCode === '0';
          }
          
          function validateElement(element, operation) {
            if (!VALID_ELEMENTS[element]) {
              // Check for array elements
              const arrayMatch = element.match(/^(cmi\.(objectives|interactions))\.(\d+)\./); 
              if (arrayMatch) {
                return true; // Allow array access
              }
              setError('401'); // Undefined data model
              return false;
            }
            
            const permissions = VALID_ELEMENTS[element];
            if (operation === 'get' && !permissions.includes('r')) {
              setError('405'); // Write only
              return false;
            }
            if (operation === 'set' && !permissions.includes('w')) {
              setError('404'); // Read only
              return false;
            }
            return true;
          }
          
          // SCORM 1.2 API
          const SCORM_12_API = {
            LMSInitialize: (param) => {
              if (param !== '' && param !== null) {
                setError('201');
                return 'false';
              }
              if (initialized) {
                setError('103');
                return 'false';
              }
              if (terminated) {
                setError('104');
                return 'false';
              }
              initialized = true;
              setError('0');
              return 'true';
            },
            
            LMSGetValue: (element) => {
              if (!initialized) {
                setError('122');
                return '';
              }
              if (terminated) {
                setError('123');
                return '';
              }
              if (!validateElement(element, 'get')) {
                return '';
              }
              
              // Synchronous fetch using XMLHttpRequest for SCORM compatibility
              try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', \`/api/progress/lesson/\${lessonId}/scorm/cmi?element=\${encodeURIComponent(element)}\`, false);
                if (authToken) xhr.setRequestHeader('Authorization', \`Bearer \${authToken}\`);
                xhr.send();
                
                if (xhr.status === 200) {
                  const data = JSON.parse(xhr.responseText);
                  setError('0');
                  return data.value || '';
                } else {
                  setError('301');
                  return '';
                }
              } catch (err) {
                setError('301');
                return '';
              }
            },
            
            LMSSetValue: (element, value) => {
              if (!initialized) {
                setError('132');
                return 'false';
              }
              if (terminated) {
                setError('133');
                return 'false';
              }
              if (!validateElement(element, 'set')) {
                return 'false';
              }
              
              try {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', \`/api/progress/lesson/\${lessonId}/scorm/cmi\`, false);
                xhr.setRequestHeader('Content-Type', 'application/json');
                if (authToken) xhr.setRequestHeader('Authorization', \`Bearer \${authToken}\`);
                xhr.send(JSON.stringify({ element, value: String(value) }));
                
                if (xhr.status === 200) {
                  setError('0');
                  return 'true';
                } else {
                  setError('351');
                  return 'false';
                }
              } catch (err) {
                setError('351');
                return 'false';
              }
            },
            
            LMSCommit: (param) => {
              if (param !== '' && param !== null) {
                setError('201');
                return 'false';
              }
              if (!initialized) {
                setError('142');
                return 'false';
              }
              if (terminated) {
                setError('143');
                return 'false';
              }
              
              try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', \`/api/progress/lesson/\${lessonId}/scorm/commit\`, false);
                if (authToken) xhr.setRequestHeader('Authorization', \`Bearer \${authToken}\`);
                xhr.send();
                
                if (xhr.status === 200) {
                  setError('0');
                  return 'true';
                } else {
                  setError('391');
                  return 'false';
                }
              } catch (err) {
                setError('391');
                return 'false';
              }
            },
            
            LMSFinish: (param) => {
              if (param !== '' && param !== null) {
                setError('201');
                return 'false';
              }
              if (!initialized) {
                setError('112');
                return 'false';
              }
              if (terminated) {
                setError('113');
                return 'false';
              }
              
              const commitResult = SCORM_12_API.LMSCommit('');
              terminated = true;
              initialized = false;
              setError('0');
              return commitResult;
            },
            
            LMSGetLastError: () => lastError,
            
            LMSGetErrorString: (errorCode) => {
              return SCORM_ERRORS[errorCode] || 'Unknown error';
            },
            
            LMSGetDiagnostic: (errorCode) => {
              return SCORM_ERRORS[errorCode] || 'No diagnostic available';
            }
          };
          
          // SCORM 2004 API
          const SCORM_2004_API = {
            Initialize: (param) => SCORM_12_API.LMSInitialize(param),
            GetValue: (element) => {
              // Map SCORM 2004 elements to 1.2 equivalents where possible
              const elementMap = {
                'cmi.learner_id': 'cmi.core.student_id',
                'cmi.learner_name': 'cmi.core.student_name',
                'cmi.location': 'cmi.core.lesson_location',
                'cmi.completion_status': 'cmi.core.lesson_status',
                'cmi.success_status': 'cmi.core.lesson_status',
                'cmi.score.raw': 'cmi.core.score.raw',
                'cmi.score.max': 'cmi.core.score.max',
                'cmi.score.min': 'cmi.core.score.min',
                'cmi.session_time': 'cmi.core.session_time',
                'cmi.total_time': 'cmi.core.total_time',
                'cmi.exit': 'cmi.core.exit',
                'cmi.mode': 'cmi.core.lesson_mode'
              };
              
              const mappedElement = elementMap[element] || element;
              return SCORM_12_API.LMSGetValue(mappedElement);
            },
            SetValue: (element, value) => {
              const elementMap = {
                'cmi.location': 'cmi.core.lesson_location',
                'cmi.completion_status': 'cmi.core.lesson_status',
                'cmi.success_status': 'cmi.core.lesson_status',
                'cmi.score.raw': 'cmi.core.score.raw',
                'cmi.score.max': 'cmi.core.score.max',
                'cmi.score.min': 'cmi.core.score.min',
                'cmi.session_time': 'cmi.core.session_time',
                'cmi.exit': 'cmi.core.exit'
              };
              
              const mappedElement = elementMap[element] || element;
              return SCORM_12_API.LMSSetValue(mappedElement, value);
            },
            Commit: (param) => SCORM_12_API.LMSCommit(param),
            Terminate: (param) => SCORM_12_API.LMSFinish(param),
            GetLastError: () => SCORM_12_API.LMSGetLastError(),
            GetErrorString: (errorCode) => SCORM_12_API.LMSGetErrorString(errorCode),
            GetDiagnostic: (errorCode) => SCORM_12_API.LMSGetDiagnostic(errorCode)
          };
          
          // Expose APIs globally
          window.API = SCORM_12_API;
          window.API_1484_11 = SCORM_2004_API;
          
          // Auto-detect and initialize for some content
          window.addEventListener('load', () => {
            console.log('SCORM APIs loaded - SCORM 1.2 and 2004 support enabled');
          });
        </script>
      </head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <iframe src="${scormLesson.packageUrl}/${entryPoint}" style="width:100%;height:100vh;border:none;overflow:hidden;" scrolling="no"></iframe>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('Error serving SCORM package:', error);
    res.status(500).send('Error loading SCORM package');
  }
});

export default router;
