import React from 'react';
import { useNavigate } from 'react-router-dom';
import amazonImg from '../../public/images/amazonlogo.jpg';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="text-center py-12 sm:py-16 md:py-20 px-4 bg-[#F9FAFB] text-black">
      {/* Hero Message */}
      <div className="inline-flex items-center bg-white px-3 sm:px-4 py-1.5 sm:py-2 shadow rounded-lg mb-4">
        <span className="text-[#FF5A00] text-base sm:text-lg font-bold">⚡</span>
        <span className="ml-1.5 sm:ml-2 text-[#FF5A00] font-semibold text-sm sm:text-lg">
          Unlock
        </span>
        <span className="ml-1.5 sm:ml-2 font-bold text-sm sm:text-lg">Your Creative Potential</span>
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 mb-2 px-2">
        with Online Design and Development Courses.
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-6 px-2">
        Learn from Industry Experts and Enhance Your Skills.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
        <button 
          onClick={() => navigate('/all-courses')}
          className="bg-[#FF5A00] hover:bg-[#FFB088] text-white px-5 py-2.5 sm:py-2 rounded text-sm font-medium transition w-full sm:w-auto"
        >
          Explore Courses
        </button>
      </div>

      {/* Logos */}
      <section className="py-6 sm:py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow flex justify-around items-center py-4 sm:py-6 px-3 sm:px-4 overflow-x-auto space-x-4 sm:space-x-6">
          <img src={amazonImg} alt="Zapier" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Spotify" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Zoom" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Amazon" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Adobe" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Notion" className="h-6 opacity-70" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={amazonImg} alt="Netflix" className="h-6 opacity-70" />
        </div>
      </section>
    </section>
  );
}
