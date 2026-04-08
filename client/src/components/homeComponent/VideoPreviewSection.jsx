import React from "react";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";

export default function VideoPreviewSection() {
  return (
    <section className="relative py-16 sm:py-20 px-4 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-100/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
            See How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Experience Learning Like Never Before
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch our platform in action and discover how we're transforming
            online education
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Decorative Frame */}
          <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl opacity-20 blur-xl" />

          {/* Video Wrapper */}
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            {/* Browser-like Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-400 border border-gray-200 max-w-md mx-auto">
                  academiq.com/learn
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/ezbJwaLmOeM?si=_Err7CnOy8ht6YvD&amp;rel=0"
                title="Academiq Platform Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </motion.div>

        {/* Stats below video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-10"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-gray-900">4.9</span>
            </div>
            <p className="text-sm text-gray-500">User Rating</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">2M+</div>
            <p className="text-sm text-gray-500">Video Views</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">150+</div>
            <p className="text-sm text-gray-500">Countries</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
