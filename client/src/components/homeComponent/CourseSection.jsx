import React from 'react';
import { motion } from 'framer-motion';
import courses from '../../data/courseData';

export default function CoursesSection() {
  return (
    <section className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Featured Courses
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">Explore our Popular Courses</p>
          </div>
          <button className="border border-gray-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-gray-100 whitespace-nowrap">
            All Courses
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                scale: 1.05,
                rotateX: 2,
                rotateY: 2,
                boxShadow: '0px 20px 30px rgba(0, 0, 0, 0.15)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded">
                  {course.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-1">
                  by <span className="font-medium">{course.instructor}</span>
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                  <span className="flex items-center gap-1">
                    ⏱ {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    👨‍🎓 {course.students} Students
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {course.offerPrice > 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          ${course.price}
                        </span>
                        <span className="text-red-500 font-semibold">
                          ${course.offerPrice}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          ${course.price}
                        </span>
                        <span className="text-green-600 font-semibold">
                          Free
                        </span>
                      </>
                    )}
                  </div>
                  <button className="text-sm text-blue-600 font-medium hover:underline">
                    View More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
