import React from "react";
import { motion } from "framer-motion";
import {
  FiClock,
  FiUser,
  FiStar,
  FiPlay,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import HeroIllustration from "../../public/images/frame.png";

const Hero = ({ title, meta, thumbnail, description, instructor, level }) => (
  <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
    {/* Background decorations */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center">
        {/* Content */}
        <div className="lg:col-span-7 xl:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb/Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                {level || "Course"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {title}
            </h1>

            {/* Description preview */}
            {description && (
              <p className="mt-4 text-gray-300 text-sm sm:text-base line-clamp-2 max-w-2xl">
                {description}
              </p>
            )}

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm">{meta.students}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiStar className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-white">
                    {meta.rating}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({meta.reviews} reviews)
                  </span>
                </div>
              </div>

              {instructor && (
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-sm">
                    {instructor.firstName} {instructor.lastName}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Thumbnail */}
        <div className="lg:col-span-5 xl:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={thumbnail || HeroIllustration}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <FiPlay className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
