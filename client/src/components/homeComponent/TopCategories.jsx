import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

const categories = [
  { title: 'Art & Design', courses: 38, icon: <Brush size={28} /> },
  { title: 'Development', courses: 38, icon: <Code size={28} /> },
  { title: 'Communication', courses: 38, icon: <Users size={28} /> },
  { title: 'Videography', courses: 38, icon: <Video size={28} /> },
  { title: 'Photography', courses: 38, icon: <Camera size={28} /> },
  { title: 'Marketing', courses: 38, icon: <BarChart size={28} /> },
  { title: 'Content Writing', courses: 38, icon: <BookOpen size={28} /> },
  { title: 'Finance', courses: 38, icon: <Mic size={28} /> },
  { title: 'Science', courses: 38, icon: <Atom size={28} /> },
  { title: 'Network', courses: 38, icon: <Network size={28} /> },
];

export default function TopCategories() {
  const [selected, setSelected] = useState(null);

  const handleSelect = idx => {
    setSelected(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Top Categories
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Explore our Popular Categories
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="border border-gray-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-gray-100 transition whitespace-nowrap"
          >
            All Categories
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {categories.map((cat, idx) => {
            const isSelected = selected === idx;

            return (
              <motion.div
                key={idx}
                whileHover={{
                  y: -4,
                  scale: 1.04,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                }}
                animate={{
                  scale: isSelected ? 1.08 : 1,
                  background: isSelected
                    ? 'linear-gradient(135deg, #ffe0b2, #ffcc80)'
                    : '#ffffff',
                  boxShadow: isSelected
                    ? '0px 20px 30px rgba(255, 102, 0, 0.2)'
                    : '0px 0px 0px rgba(0, 0, 0, 0)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => handleSelect(idx)}
                className={`border rounded-lg sm:rounded-xl px-3 sm:px-6 py-4 sm:py-8 text-center cursor-pointer ${
                  isSelected ? 'text-orange-600' : 'text-black'
                }`}
              >
                <div
                  className={`flex justify-center mb-2 sm:mb-4 ${
                    isSelected ? 'text-orange-600' : 'text-orange-500'
                  }`}
                >
                  <div className="scale-75 sm:scale-100">{cat.icon}</div>
                </div>
                <h3 className="font-semibold text-xs sm:text-base mb-1">{cat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{cat.courses} Courses</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
