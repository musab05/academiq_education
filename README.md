# Academiq LMS - Learning Management System

A comprehensive, AI-powered Learning Management System built with modern web technologies, featuring real-time collaboration, live classrooms, and intelligent content processing.

## 🌟 Overview

Academiq is a full-featured LMS platform designed for educational institutions, corporate training, and online learning. It combines traditional LMS capabilities with cutting-edge features like AI-powered content analysis, live virtual classrooms with WebRTC, and gamification.

## 🏗️ Architecture

The project consists of three main components:

### 1. **Server** (Backend API)
- **Technology**: Node.js, Express.js, MongoDB
- **Purpose**: RESTful API, WebSocket signaling, data management
- **Port**: 3000

### 2. **Client** (Frontend)
- **Technology**: React.js, Redux, Tailwind CSS, Framer Motion
- **Purpose**: User interface and experience
- **Port**: 5173

### 3. **Chatbot** (AI Service)
- **Technology**: Python, Flask, OpenAI Whisper, NLP libraries
- **Purpose**: Content processing, quiz generation, video transcription
- **Port**: 5000

---

## 👥 User Roles & Responsibilities

### 1. **SuperAdmin**
**Highest level of access with complete system control**

**Capabilities:**
- Manage all institutes and their settings
- View global analytics and reports across all institutes
- Create and manage admin accounts
- Configure system-wide settings
- Access all features of lower roles

**Key Tasks:**
- Institute management and oversight
- System configuration and maintenance
- Global reporting and analytics
- User role assignment

---

### 2. **Admin**
**Institute-level administrator with full control over their institute**

**Capabilities:**
- Manage users (instructors, students)
- Create and manage departments
- Oversee all courses and classrooms
- Configure institute settings
- Generate comprehensive reports
- Manage teams and enrollments
- Design certificates
- Handle events and notifications

**Key Tasks:**
- User management and role assignment
- Course and curriculum oversight
- Department organization
- Performance monitoring
- Certificate design and issuance

---

### 3. **Instructor**
**Content creator and educator**

**Capabilities:**
- Create and manage courses
- Design lessons (7 types: Text, Video, Block, Quiz, Assignment, Document, SCORM)
- Create and manage live classrooms
- Schedule and conduct live sessions
- Grade assignments and quizzes
- Track student progress
- Generate course reports
- Manage course enrollments
- Create and manage teams
- Upload and manage resources

**Key Tasks:**
- Course content creation
- Lesson design and organization
- Live teaching sessions
- Student assessment and grading
- Progress monitoring
- Content updates and improvements

---

### 4. **Student**
**Learner with access to enrolled courses and classrooms**

**Capabilities:**
- Browse and enroll in courses
- Access learning materials
- Watch video lessons (YouTube, Vimeo, uploaded)
- Complete quizzes and assignments
- Join live classroom sessions
- Track personal progress
- Participate in teams
- View achievements and leaderboard
- Create and manage playlists
- Receive notifications
- View certificates

**Key Tasks:**
- Course enrollment and learning
- Assignment submission
- Quiz participation
- Live session attendance
- Progress tracking
- Team collaboration

---

## 🎯 Core Features

### 📚 Course Management
- **Multi-format Lessons**: Support for 7 lesson types
  - Text lessons with rich formatting
  - Video lessons (YouTube, Vimeo, uploaded)
  - Block-based lessons (drag-and-drop builder)
  - Interactive quizzes with AI generation
  - Assignments with file submissions
  - Document lessons (PDF, presentations)
  - SCORM packages
- **Chapter Organization**: Structured curriculum with chapters
- **Categories & Tags**: Easy course discovery
- **Progress Tracking**: Real-time progress updates
- **Certificates**: Automated certificate generation on completion

### 🎥 Live Classrooms
- **WebRTC Integration**: Real-time video/audio communication
- **Session Management**: Schedule and manage live sessions
- **Attendance Tracking**: Automatic attendance recording
- **Session Recording**: Record and playback sessions
- **Screen Sharing**: Share presentations and content
- **Chat**: Real-time messaging during sessions
- **Participant Management**: Control who can join
- **Analytics**: Engagement and attendance reports

### 🤖 AI-Powered Features
- **Content Analysis**: Automatic keyword extraction, entity recognition
- **Video Transcription**: YouTube video transcription using OpenAI Whisper
- **Quiz Generation**: AI-generated questions from lesson content
- **Difficulty Assessment**: Automatic content difficulty rating
- **Topic Extraction**: Intelligent topic identification
- **Sentiment Analysis**: Content sentiment evaluation

### 📊 Progress & Analytics
- **Real-time Progress**: Live progress updates in sidebar
- **Video Progress Tracking**: Track watch time, skips, completion
- **Quiz Analytics**: Score tracking and attempt history
- **Assignment Grading**: Instructor grading with feedback
- **Course Reports**: Comprehensive progress reports
- **User Reports**: Individual student performance
- **Team Reports**: Group performance analytics
- **Lesson Analytics**: Per-lesson engagement metrics

### 🏆 Gamification
- **Achievements**: Unlock badges and rewards
- **Leaderboard**: Competitive rankings
- **Points System**: Earn points for activities
- **Progress Milestones**: Celebrate learning milestones

### 👥 Collaboration
- **Teams**: Create and manage learning groups
- **Team Chat**: Real-time team messaging
- **Team Meetings**: Dedicated team video calls
- **Team Enrollments**: Enroll entire teams in courses
- **Shared Resources**: Team-based resource sharing

### 📱 User Experience
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Mode Ready**: Modern UI with Tailwind CSS
- **Smooth Animations**: Framer Motion for fluid interactions
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Notifications**: Stay updated with activities
- **Playlist Management**: Organize courses in custom playlists

---

## 🚀 What Makes Academiq Different?

### 1. **Integrated AI Processing**
Unlike traditional LMS platforms, Academiq includes a dedicated AI service that:
- Automatically processes and analyzes content
- Generates quizzes from lesson materials
- Transcribes video content for accessibility
- Provides intelligent content recommendations

### 2. **Built-in Live Classrooms**
- Native WebRTC implementation (no third-party dependencies)
- Integrated with course structure
- Automatic attendance and recording
- Session analytics and engagement tracking

### 3. **Comprehensive Lesson Types**
Support for 7 different lesson formats in one platform:
- Traditional text and video
- Interactive block-based lessons
- SCORM compliance for enterprise content
- Document lessons for presentations
- Assignments with grading workflow
- AI-powered quizzes

### 4. **Real-time Progress Tracking**
- Live progress updates without page refresh
- Video progress tracking (even for YouTube videos)
- Sidebar shows real-time completion status
- Instant feedback on quiz submissions

### 5. **Multi-tenant Architecture**
- Support for multiple institutes
- Institute-level customization
- Separate analytics per institute
- Scalable for enterprise use

### 6. **Team-based Learning**
- Create learning teams
- Team enrollments
- Team chat and meetings
- Collaborative learning environment

### 7. **Gamification Built-in**
- Not an add-on, but core feature
- Achievements and badges
- Leaderboards
- Points and rewards system

---

## 🛠️ Technology Stack

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO for WebRTC signaling
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Video Processing**: FFmpeg integration

### Frontend (Client)
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Video Player**: Custom player with YouTube IFrame API

### AI Service (Chatbot)
- **Language**: Python 3.x
- **Framework**: Flask
- **Video Processing**: pytubefix, FFmpeg
- **Transcription**: OpenAI Whisper
- **NLP**: spaCy, NLTK
- **Content Analysis**: Custom NLP pipeline
- **Database**: MongoDB (shared with server)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (v5.0 or higher)
- FFmpeg (for video processing)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Academiq
```

### 2. Server Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/Academiq
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

Start server:
```bash
npm start
```

### 3. Client Setup
```bash
cd client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

Start client:
```bash
npm run dev
```

### 4. Chatbot Setup
```bash
cd chatbot
pip install -r requirements.txt
```

Create `.env` file:
```env
FLASK_PORT=5000
MONGO_URI=mongodb://localhost:27017/Academiq
```

Start chatbot:
```bash
python app.py
```

---

## 📁 Project Structure

```
Academiq/
├── server/                 # Backend API
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth, validation
│   └── uploads/           # File storage
│
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   └── context/       # React contexts
│   └── public/            # Static assets
│
└── chatbot/               # AI service
    ├── app.py             # Flask application
    ├── mainprocessor.py   # Content processor
    ├── requirements.txt   # Python dependencies
    └── models/            # AI models cache
```

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS protection
- Input validation and sanitization
- Secure file upload handling
- XSS protection headers
- MongoDB injection prevention

---

## 📊 Database Schema

### Key Collections
- **Users**: User accounts and profiles
- **Courses**: Course information
- **Lessons**: Lesson content and metadata
- **Progress**: User progress tracking
- **Classrooms**: Live classroom sessions
- **Teams**: Learning groups
- **Departments**: Organizational units
- **Institutes**: Multi-tenant support
- **Certificates**: Certificate templates and records
- **Notifications**: User notifications

---

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices
- **Smooth Animations**: Framer Motion transitions
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Modal Dialogs**: Contextual actions
- **Drag & Drop**: Intuitive content organization
- **Collapsible Sidebar**: Optimized screen space
- **Dark Mode Ready**: Modern color scheme

---

## 🔄 Real-time Features

- Live progress updates
- Real-time notifications
- WebRTC video/audio
- Live chat messaging
- Attendance tracking
- Session recording
- Collaborative editing

---

## 📈 Analytics & Reporting

### Course Analytics
- Enrollment statistics
- Completion rates
- Average progress
- Time spent per lesson
- Popular courses

### User Analytics
- Individual progress reports
- Quiz performance
- Assignment grades
- Attendance records
- Engagement metrics

### Classroom Analytics
- Session attendance
- Participation rates
- Average session duration
- Recording views

---

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:slug` - Get course details
- `PUT /api/courses/:slug` - Update course
- `DELETE /api/courses/:slug` - Delete course

### Lessons
- `GET /api/lessons/:courseId` - Get course lessons
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Progress
- `GET /api/progress/:courseId` - Get course progress
- `POST /api/progress/video/:lessonId` - Update video progress
- `POST /api/progress/quiz/:lessonId` - Submit quiz

### Classrooms
- `GET /api/classrooms` - List classrooms
- `POST /api/classrooms` - Create classroom
- `GET /api/classrooms/:id/sessions` - Get sessions
- `POST /api/classrooms/:id/join` - Join session

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Development Team

- **Backend Development**: Node.js, Express, MongoDB
- **Frontend Development**: React, Redux, Tailwind
- **AI/ML Development**: Python, Flask, NLP
- **DevOps**: Server deployment and maintenance

---

## 📞 Support

For support and queries:
- Email: support@academiq.com
- Documentation: [docs.academiq.com]
- Issues: GitHub Issues

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile applications (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Integration with third-party tools (Zoom, Google Meet)
- [ ] AI-powered content recommendations
- [ ] Automated grading for assignments
- [ ] Multi-language support
- [ ] Advanced gamification features
- [ ] Social learning features
- [ ] Marketplace for courses
- [ ] White-label solutions

---

## ⚡ Performance

- **Fast Load Times**: Optimized bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Caching**: Redis integration ready
- **CDN Ready**: Static asset optimization
- **Database Indexing**: Optimized queries
- **WebSocket Efficiency**: Minimal latency

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Built with ❤️ for modern education**
