import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiUser, FiStar, FiPlay } from 'react-icons/fi';
import HeroIllustration from '../../public/images/frame.png';

const Hero = ({ title, meta, thumbnail }) => (
  <section className="bg-black text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
      <div className="md:col-span-8">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          <div className="mt-2 sm:mt-3 text-gray-300 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2"><FiUser className="w-4 h-4" /> <span>{meta.students}</span></div>
            <div className="flex items-center gap-2"><FiStar className="w-4 h-4" /> <span>{meta.rating} ({meta.reviews} reviews)</span></div>
          </div>
        </div>
      </div>

      <div className="md:col-span-4 flex justify-center md:justify-end">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full sm:w-56 h-32 sm:h-36 bg-white rounded-md overflow-hidden shadow-lg">
          <img src={thumbnail || HeroIllustration} alt="course" className="w-full h-full object-cover" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;