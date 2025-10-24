import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Settings, Eye } from 'lucide-react';
import { setCurrentCourse } from '../../store/slices/lessonSlice';
import thumbnail from '../../public/images/thumbnail.jpg';

const CourseCard = ({ course, view }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCourseClick = () => {
    dispatch(setCurrentCourse(course._id));
    navigate(`/course-overview/${course.slug}`);
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    dispatch(setCurrentCourse(course._id));
    navigate('/course-overview/settings');
  };
  if (view === "list") {
    return (
      <article onClick={handleCourseClick} className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md flex gap-6 items-center cursor-pointer">
        <div className="flex-shrink-0 w-56">
          <div className="relative rounded-lg overflow-hidden h-40">
            <img src={course.thumbnail || course.image || thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 text-xs font-medium bg-black text-white px-2 py-1 rounded">{course.category}</span>
          </div>
        </div>
        <div className="flex-1 py-3">
          <div className="text-xs text-gray-500">by {course.author?.firstName ? `${course.author.firstName} ${course.author.lastName}` : course.author}</div>
          <h3 className="font-semibold text-gray-900 mt-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{course.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={handleSettingsClick}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Course Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: '0px 20px 30px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-xl overflow-hidden cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="relative">
        <img src={course.thumbnail || course.image || thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        <span className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded">
          {course.category}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">
              by <span className="font-medium">{course.author?.firstName ? `${course.author.firstName} ${course.author.lastName}` : course.author}</span>
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
          </div>
          <button
            onClick={handleSettingsClick}
            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Course Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">{course.description || 'No description'}</p>
      </div>
    </motion.div>
  );
};

export default CourseCard;