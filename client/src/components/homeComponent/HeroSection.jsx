import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, BookOpen } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      value: "50K+",
      label: "Active Students",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      value: "200+",
      label: "Quality Courses",
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: "4.9",
      label: "Average Rating",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/40 to-yellow-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg shadow-orange-100/50 border border-orange-100 mb-6"
          >
            <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
              <span className="text-white text-xs">⚡</span>
            </span>
            <span className="text-sm font-medium text-gray-700">
              <span className="text-orange-600 font-semibold">Unlock</span> Your
              Creative Potential
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Transform Your Future with
            <span className="block mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
              Expert-Led Learning
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Join thousands of learners mastering new skills with our
            comprehensive courses. Learn from industry experts at your own pace.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <button
              onClick={() => navigate("/all-courses")}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
            >
              Explore Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/all-classrooms")}
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-8 py-3.5 rounded-xl font-semibold shadow-lg border border-gray-200 hover:border-orange-200 transition-all duration-300"
            >
              <Play className="w-5 h-5 text-orange-500" />
              Live Classrooms
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md text-orange-500">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="relative bg-white/50 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <p className="text-center text-sm text-gray-500 mb-6">
            Trusted by learners from top companies
          </p>
          <div className="overflow-hidden">
            <div className="flex items-center gap-12 animate-scroll whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {[
                    "Google",
                    "Microsoft",
                    "Amazon",
                    "Meta",
                    "Apple",
                    "Netflix",
                    "Spotify",
                  ].map((company, idx) => (
                    <React.Fragment key={`${i}-${idx}`}>
                      <span className="text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-default">
                        {company}
                      </span>
                      {idx < 6 && (
                        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                  {i === 0 && <div className="w-12 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}
