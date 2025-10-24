from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
from mainprocessor import ContentAnalyzer, LessonProcessor
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
content_analyzer = ContentAnalyzer()
lesson_processor = LessonProcessor()

def preprocess_text(text):
    """Preprocess text for RAG"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.route('/api/process-content', methods=['POST', 'OPTIONS'])
def process_content():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        text = data.get('text', '')
        lesson_type = data.get('lessonType', 'text')
        lesson_id = data.get('lessonId')
        course_id = data.get('courseId')
        video_url = data.get('videoUrl', '')
        document_paths = data.get('documentPaths', [])
        
        # Process video if provided
        if lesson_type == 'video' and video_url:
            try:
                # Check if it's a YouTube URL or uploaded file
                if 'youtube.com' in video_url or 'youtu.be' in video_url:
                    logger.info(f'Processing YouTube video: {video_url}')
                    video_data = lesson_processor.process_youtube_url(video_url)
                    text = video_data.get('content', '')
                    logger.info(f'Extracted YouTube transcript: {len(text)} characters')
                elif video_url.startswith('/uploads/videos/'):
                    # Uploaded video file
                    video_path = os.path.join(os.path.dirname(__file__), '..', 'server', video_url.lstrip('/'))
                    if os.path.exists(video_path):
                        logger.info(f'Processing uploaded video: {video_path}')
                        video_data = lesson_processor.process_video(video_path, os.path.basename(video_path))
                        text = video_data.get('content', '')
                        logger.info(f'Extracted video transcript: {len(text)} characters')
                    else:
                        logger.warning(f'Video file not found: {video_path}')
            except Exception as e:
                logger.error(f'Video processing failed: {str(e)}')
                # Continue with empty text if video processing fails
        
        # Process documents if provided
        if lesson_type == 'document' and document_paths:
            try:
                document_texts = []
                for doc_path in document_paths:
                    file_path = os.path.join(os.path.dirname(__file__), '..', 'server', doc_path.lstrip('/'))
                    if os.path.exists(file_path):
                        logger.info(f'Processing document: {file_path}')
                        ext = os.path.splitext(file_path)[1].lower()
                        
                        if ext == '.pdf':
                            doc_data = lesson_processor.process_pdf(file_path, os.path.basename(file_path))
                        elif ext in ['.docx', '.doc']:
                            doc_data = lesson_processor.process_docx(file_path, os.path.basename(file_path))
                        elif ext == '.txt':
                            with open(file_path, 'r', encoding='utf-8') as f:
                                doc_data = {'content': f.read()}
                        else:
                            logger.warning(f'Unsupported document type: {ext}')
                            continue
                        
                        document_texts.append(doc_data.get('content', ''))
                        logger.info(f'Extracted document text: {len(doc_data.get("content", ""))} characters')
                    else:
                        logger.warning(f'Document file not found: {file_path}')
                
                if document_texts:
                    text = '\n\n'.join(document_texts)
                    logger.info(f'Total extracted text from documents: {len(text)} characters')
            except Exception as e:
                logger.error(f'Document processing failed: {str(e)}')
                # Continue with empty text if document processing fails
        
        # If still no text after processing, return error
        if not text or not text.strip():
            logger.warning(f'No text content extracted for lesson {lesson_id}')
            return jsonify({
                'processedText': '',
                'metadata': {
                    'lessonType': lesson_type,
                    'wordCount': 0,
                    'error': 'No content could be extracted'
                }
            }), 200
        
        # Preprocess the text
        processed_text = preprocess_text(text)
        
        # Use ContentAnalyzer for advanced analysis
        keywords = content_analyzer.extract_keywords(processed_text, top_k=15)
        entities = content_analyzer.extract_entities(processed_text)
        difficulty = content_analyzer.assess_difficulty(processed_text)
        sentiment = content_analyzer.analyze_sentiment(processed_text)
        
        # Extract topics if text is long enough
        topics = []
        if len(processed_text.split()) > 50:
            topics = content_analyzer.extract_topics([processed_text])
        
        # Save to database
        if lesson_id and course_id:
            try:
                import pymongo
                from bson import ObjectId
                client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/Academiq'))
                db = client.get_database()
                
                course = db.courses.find_one({'_id': ObjectId(course_id)})
                
                db.lessoncontents.update_one(
                    {'lesson': ObjectId(lesson_id)},
                    {'$set': {
                        'lesson': ObjectId(lesson_id),
                        'course': ObjectId(course_id),
                        'courseTitle': course.get('title', '') if course else '',
                        'courseDescription': course.get('description', '') if course else '',
                        'processedText': processed_text,
                        'lessonType': lesson_type,
                        'metadata': {
                            'wordCount': difficulty['word_count'],
                            'sentenceCount': difficulty['sentence_count'],
                            'keywords': [kw['keyword'] for kw in keywords],
                            'entities': entities,
                            'difficulty': difficulty,
                            'sentiment': sentiment,
                            'topics': topics
                        }
                    }},
                    upsert=True
                )
                logger.info(f'Saved processed content for lesson {lesson_id}')
            except Exception as e:
                logger.error(f'Failed to save to database: {str(e)}')
        
        return jsonify({
            'processedText': processed_text,
            'metadata': {
                'lessonType': lesson_type,
                'wordCount': difficulty['word_count'],
                'sentenceCount': difficulty['sentence_count'],
                'keywords': [kw['keyword'] for kw in keywords],
                'keywordScores': keywords,
                'entities': entities,
                'difficulty': difficulty,
                'sentiment': sentiment,
                'topics': topics
            }
        })
    except Exception as e:
        logger.error(f'Error processing content: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-content', methods=['POST', 'OPTIONS'])
def generate_content():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        prompt = data.get('prompt', '')
        lesson_id = data.get('lessonId')
        course_id = data.get('courseId')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        import pymongo
        from bson import ObjectId
        client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/Academiq'))
        db = client.get_database()
        
        strict_mode = data.get('strictMode', False)
        context = ''
        has_context = False
        
        logger.info(f'Database: {db.name}, Collections: {db.list_collection_names()[:5]}')
        
        # Priority 1: Check preprocessed lesson content
        if lesson_id:
            try:
                lesson_content = db.lessoncontents.find_one({'lesson': ObjectId(lesson_id)})
                if lesson_content and lesson_content.get('processedText'):
                    context = f"Course: {lesson_content.get('courseTitle', '')}\n\nDescription: {lesson_content.get('courseDescription', '')}\n\nLesson Content:\n{lesson_content['processedText']}"
                    has_context = True
                    logger.info('Using preprocessed content')
            except Exception as e:
                logger.error(f'Error fetching preprocessed content: {str(e)}')
        
        # Priority 2: Fetch course and its text lessons
        if not has_context and course_id:
            logger.info('No preprocessed content, fetching course and text lessons')
            try:
                course = db.courses.find_one({'_id': ObjectId(course_id)})
                if course:
                    course_info = f"Course: {course.get('title', '')}\nDescription: {course.get('description', '')}"
                    logger.info(f'Course: {course.get("title")}')
                    
                    lessons = list(db.lessons.find({'course': ObjectId(course_id)}).sort('order', 1))
                    logger.info(f'Found {len(lessons)} lessons')
                    
                    lesson_texts = []
                    for lesson in lessons:
                        text_lesson = db.textlessons.find_one({'lesson': lesson['_id']})
                        if text_lesson and text_lesson.get('sections'):
                            for section in text_lesson['sections']:
                                if section.get('content'):
                                    lesson_texts.append(preprocess_text(section['content']))
                        
                        block_lesson = db.blocklessons.find_one({'lesson': lesson['_id']})
                        if block_lesson and block_lesson.get('blocks'):
                            for block in block_lesson['blocks']:
                                if block.get('content'):
                                    lesson_texts.append(preprocess_text(block['content']))
                    
                    if lesson_texts:
                        context = f"{course_info}\n\nCourse Content:\n{' '.join(lesson_texts)}"
                        has_context = True
                        logger.info(f'Built context: {len(lesson_texts)} segments')
            except Exception as e:
                logger.error(f'Error: {str(e)}')
        
        logger.info(f'Final context length: {len(context)} chars')
        logger.info(f'Has context: {has_context}')
        logger.info(f'Context preview: {context[:200]}...')
        
        if has_context and strict_mode:
            system_prompt = f"""{context}\n\nQuestion: {prompt}\n\nAnswer using ONLY the course information above. Be helpful and conversational."""
        elif has_context:
            system_prompt = f"Use this context to answer:\n\n{context}\n\nQuestion: {prompt}"
        elif strict_mode:
            return jsonify({'content': 'I can only answer questions about this course.', 'hasContext': False})
        else:
            system_prompt = f"Educational assistant: {prompt}"
        
        # Use ollama for generation
        import ollama
        logger.info(f'Sending prompt to Ollama (first 300 chars): {system_prompt[:300]}...')
        response = ollama.chat(
            model="mistral",
            messages=[{"role": "user", "content": system_prompt}]
        )
        logger.info(f'Ollama response (first 200 chars): {response["message"]["content"][:200]}...')
        
        result = {
            'content': response["message"]["content"],
            'hasContext': has_context
        }
        logger.info(f'Returning hasContext: {has_context}')
        return jsonify(result)
    except Exception as e:
        logger.error(f'Error generating content: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-questions', methods=['POST', 'OPTIONS'])
def generate_questions():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        prompt = data.get('prompt', '')
        lesson_id = data.get('lessonId')
        course_id = data.get('courseId')
        difficulty = data.get('difficulty', 'medium')
        question_type = data.get('questionType', 'mixed')
        question_count = min(int(data.get('questionCount', 5)), 10)
        existing_questions = data.get('existingQuestions', [])
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        # Check if there's existing lesson content for RAG
        import pymongo
        from bson import ObjectId
        client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/Academiq'))
        db = client.get_database()
        
        lesson_content = None
        if lesson_id:
            try:
                lesson_content = db.lessoncontents.find_one({'lesson': ObjectId(lesson_id)})
            except:
                pass
        
        context_info = ""
        actual_topic = prompt
        if lesson_content and lesson_content.get('processedText'):
            context_info = f"\n\nBased on this lesson content:\n{lesson_content['processedText'][:2000]}"
            actual_topic = f"the lesson content above"
        
        existing_q_text = ""
        if existing_questions:
            existing_q_text = f"\n\nExisting questions (avoid duplicates):\n" + "\n".join([f"- {q}" for q in existing_questions[:10]])
        
        # Use AI to generate varied questions
        import json
        import ollama
        
        # Question type distribution based on selection
        if question_type == 'mixed':
            type_distribution = ['single-select', 'multi-select', 'true-false', 'fill-blank', 'essay']
        else:
            type_distribution = [question_type]
        
        try:
            type_instruction = f"Question type: {question_type}" if question_type != 'mixed' else "Use varied question types (single-select, multi-select, true-false, fill-blank, essay)"
            
            logger.info(f'Generating questions - Lesson ID: {lesson_id}, Has content: {bool(lesson_content)}')
            if lesson_content:
                logger.info(f'Using lesson content: {len(lesson_content.get("processedText", ""))} chars')
            
            system_prompt = f"""Create {question_count} diverse quiz questions about: {actual_topic}
Difficulty: {difficulty}
{type_instruction}{context_info}{existing_q_text}

Use varied question formats:
- Definitions (What is...?)
- Applications (How would you...?)
- Analysis (Why does...?)
- Comparisons (What's the difference...?)
- Scenarios (In this situation...?)
- Evaluations (Which is best...?)

Format each question:
Q: [question text]
T: [single-select/multi-select/true-false/fill-blank/essay]
O: [option1|option2|option3|option4] (skip for fill-blank/essay)
A: [correct answer(s), use | for multiple]
E: [brief explanation]
---

Make questions practical and engaging."""
            
            response = ollama.chat(
                model="mistral",
                messages=[{"role": "user", "content": system_prompt}]
            )
            
            content = response["message"]["content"]
            questions_data = []
            
            # Parse structured format
            question_blocks = content.split('---')
            for block in question_blocks:
                if 'Q:' not in block:
                    continue
                    
                lines = block.strip().split('\n')
                q_data = {}
                
                for line in lines:
                    if line.startswith('Q:'):
                        q_data['question'] = line[2:].strip()
                    elif line.startswith('T:'):
                        q_type = line[2:].strip().lower()
                        if q_type in type_distribution:
                            q_data['type'] = q_type
                    elif line.startswith('O:'):
                        q_data['options'] = [o.strip() for o in line[2:].split('|') if o.strip()]
                    elif line.startswith('A:'):
                        q_data['correctAnswers'] = [a.strip() for a in line[2:].split('|') if a.strip()]
                    elif line.startswith('E:'):
                        q_data['explanation'] = line[2:].strip()
                
                if q_data.get('question'):
                    q_data['points'] = 1
                    if not q_data.get('type'):
                        q_data['type'] = question_type if question_type != 'mixed' else 'single-select'
                    # Ensure type matches selection if not mixed
                    if question_type != 'mixed' and q_data.get('type') != question_type:
                        q_data['type'] = question_type
                    questions_data.append(q_data)
                    
                if len(questions_data) >= question_count:
                    break
        except Exception as e:
            logger.error(f'AI generation failed: {e}, using templates')
            logger.exception(e)
            questions_data = []
        
        # Fallback with varied templates
        if len(questions_data) < question_count:
            # Use lesson content for fallback if available
            fallback_topic = prompt
            if lesson_content and lesson_content.get('processedText'):
                content_preview = lesson_content['processedText'][:500]
                fallback_topic = f"the lesson material"
            
            question_starters = [
                f'What is the primary purpose of {fallback_topic}?',
                f'How does {fallback_topic} work in practice?',
                f'Which statement about {fallback_topic} is true?',
                f'Explain the key concept of {fallback_topic}',
                f'Compare and contrast aspects of {fallback_topic}',
                f'Why is {fallback_topic} important?',
                f'In what scenario would you use {fallback_topic}?',
                f'Identify the main characteristic of {fallback_topic}',
                f'Describe the process involved in {fallback_topic}',
                f'Evaluate the effectiveness of {fallback_topic}'
            ]
            
            for i in range(len(questions_data), question_count):
                q_type = type_distribution[i % len(type_distribution)]
                q_text = question_starters[i % len(question_starters)]
                
                if q_type in ['fill-blank', 'essay']:
                    questions_data.append({
                        'question': q_text,
                        'type': q_type,
                        'options': [],
                        'correctAnswers': ['Sample answer'],
                        'explanation': f'This question assesses understanding of the lesson content.',
                        'points': 2 if q_type == 'essay' else 1
                    })
                else:
                    questions_data.append({
                        'question': q_text,
                        'type': q_type,
                        'options': ['Option A', 'Option B', 'Option C', 'Option D'] if q_type != 'true-false' else ['True', 'False'],
                        'correctAnswers': ['Option A'] if q_type != 'true-false' else ['True'],
                        'explanation': f'This tests knowledge of the lesson content.',
                        'points': 1
                    })
        
        # Format questions for all 5 types
        formatted_questions = []
        for idx, q in enumerate(questions_data):
            q_type = q.get('type', 'single-select')
            options = q.get('options', [])
            
            # Handle different question types
            if q_type == 'true-false':
                options = ['True', 'False']
            elif q_type in ['fill-blank', 'essay']:
                options = []  # No options for text-based questions
            elif len(options) < 2:
                options = ['Option A', 'Option B', 'Option C', 'Option D']
            
            correct_answers = q.get('correctAnswers', [])
            if not correct_answers:
                if q_type in ['fill-blank', 'essay']:
                    correct_answers = ['']  # Empty for manual grading
                elif options:
                    correct_answers = [options[0]]
            
            formatted_questions.append({
                'id': str(abs(hash(q['question'] + str(idx))))[-10:],
                'type': q_type,
                'question': q['question'],
                'options': options,
                'correctAnswers': correct_answers,
                'points': q.get('points', 2 if q_type == 'essay' else 1),
                'correctFeedback': f"Correct! {q.get('explanation', '')}",
                'incorrectFeedback': f"Incorrect. {q.get('explanation', 'Please review the material.')}"
            })
        
        return jsonify({
            'questions': formatted_questions,
            'hasContext': bool(lesson_content)
        })
    except Exception as e:
        logger.error(f'Error generating questions: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
