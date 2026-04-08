import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Code,
  Camera,
  Brush,
  Video,
  Users,
  Mic,
  BarChart,
  BookOpen,
  Atom,
  Network,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    title: "Art & Design",
    courses: 38,
    icon: <Brush size={24} />,
    color: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-50",
  },
  {
    title: "Development",
    courses: 52,
    icon: <Code size={24} />,
    color: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-50",
  },
  {
    title: "Communication",
    courses: 28,
    icon: <Users size={24} />,
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
  },
  {
    title: "Videography",
    courses: 35,
    icon: <Video size={24} />,
    color: "from-purple-500 to-violet-500",
    bgLight: "bg-purple-50",
  },
  {
    title: "Photography",
    courses: 42,
    icon: <Camera size={24} />,
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    title: "Marketing",
    courses: 31,
    icon: <BarChart size={24} />,
    color: "from-cyan-500 to-teal-500",
    bgLight: "bg-cyan-50",
  },
  {
    title: "Content Writing",
    courses: 24,
    icon: <BookOpen size={24} />,
    color: "from-orange-500 to-red-500",
    bgLight: "bg-orange-50",
  },
  {
    title: "Finance",
    courses: 29,
    icon: <Mic size={24} />,
    color: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50",
  },
  {
    title: "Science",
    courses: 45,
    icon: <Atom size={24} />,
    color: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50",
  },
  {
    title: "Networking",
    courses: 33,
    icon: <Network size={24} />,
    color: "from-rose-500 to-pink-500",
    bgLight: "bg-rose-50",
  },
];

export default function TopCategories() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-b from-white via-orange-50/30 to-white py-16 sm:py-20 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-50/60 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
              Browse Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Explore Our Top{" "}
              <span className="text-orange-500">Categories</span>
            </h2>
            <p className="text-gray-600 max-w-xl">
              Choose from a wide variety of courses across multiple disciplines
              and start your learning journey today.
            </p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => navigate("/all-courses")}
            className="group inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-300 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-orange-600 shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap"
          >
            All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {categories.map((cat, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredIndex(idx)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => navigate("/all-courses")}
                className={`relative group bg-white rounded-2xl p-5 sm:p-6 cursor-pointer border-2 transition-all duration-300 ${
                  isHovered
                    ? "border-orange-300 shadow-xl shadow-orange-100/50"
                    : "border-gray-100 shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-4 transition-all duration-300 ${
                    isHovered
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-lg`
                      : `${cat.bgLight} text-gray-700`
                  }`}
                >
                  {cat.icon}
                </div>

                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {cat.courses} Courses
                </p>

                {/* Hover Arrow */}
                <div
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isHovered
                      ? "opacity-100 bg-orange-100 text-orange-600"
                      : "opacity-0"
                  }`}
                >
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
