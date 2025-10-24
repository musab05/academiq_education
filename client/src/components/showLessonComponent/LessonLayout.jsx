import React from 'react';
import { motion } from 'framer-motion';

function LessonLayout({ titleMeta, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white rounded-lg shadow border p-6">
      <div className="bg-black text-white rounded-md p-4 -mt-8 mb-6 shadow-inner flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-300">{titleMeta.typeLabel}</div>
          <div className="text-lg font-semibold mt-1">{titleMeta.title}</div>
          <div className="text-xs text-gray-400 mt-1">{titleMeta.sub || ''}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-300">{titleMeta.author || 'EduPress'}</div>
          <div className="bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium">{titleMeta.cta || 'Continue'}</div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default LessonLayout;