import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiClock,
  FiAward,
  FiGlobe,
  FiBarChart2,
  FiCheck,
  FiBookOpen,
} from "react-icons/fi";

const SidebarCard = ({
  price,
  lectures,
  level,
  language,
  onEnroll,
  isEnrolled,
  enrolling,
  checkingEnrollment,
  duration,
}) => {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
        {/* Price Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold">{price}</span>
            {price !== "Free" && (
              <span className="text-white/70 text-sm">one-time</span>
            )}
          </div>
          {price === "Free" && (
            <p className="text-white/80 text-sm mt-1">No payment required</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Enroll Button */}
          <button
            onClick={onEnroll}
            disabled={enrolling || checkingEnrollment}
            className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isEnrolled
                ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-orange-500/25"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {checkingEnrollment ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking...
              </>
            ) : enrolling ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enrolling...
              </>
            ) : isEnrolled ? (
              <>
                <FiPlay className="w-5 h-5" />
                Continue Learning
              </>
            ) : (
              <>
                <FiBookOpen className="w-5 h-5" />
                Enroll Now
              </>
            )}
          </button>

          {/* Course Info */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Course Includes
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiPlay className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700">Total Lectures</span>
                </div>
                <span className="font-semibold text-gray-900">{lectures}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-gray-700">Skill Level</span>
                </div>
                <span className="font-semibold text-gray-900 capitalize">
                  {level}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiGlobe className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700">Language</span>
                </div>
                <span className="font-semibold text-gray-900">{language}</span>
              </div>
            </div>
          </div>

          {/* What you get */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              What You Get
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-orange-600" />
                </div>
                Full lifetime access
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-orange-600" />
                </div>
                Certificate of completion
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-orange-600" />
                </div>
                Access on mobile and desktop
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-orange-600" />
                </div>
                Q&A support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default SidebarCard;
