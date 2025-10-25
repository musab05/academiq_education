import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const BadgeCard = ({ badge, earned = false, progress = null }) => {
  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-cyan-400 to-blue-600'
  };

  const tierBorders = {
    bronze: 'border-amber-700',
    silver: 'border-gray-500',
    gold: 'border-yellow-500',
    diamond: 'border-cyan-500'
  };

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        earned
          ? `bg-gradient-to-br ${tierColors[badge.tier]} ${tierBorders[badge.tier]} shadow-lg`
          : 'bg-gray-100 border-gray-300 opacity-60'
      }`}
    >
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-xl">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}
      <div className="text-center">
        <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale'}`}>{badge.icon}</div>
        <h3 className={`font-bold text-sm mb-1 ${earned ? 'text-white' : 'text-gray-600'}`}>
          {badge.name}
        </h3>
        <p className={`text-xs ${earned ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
          {badge.description}
        </p>
        {earned && badge.earnedAt && (
          <p className="text-xs text-white text-opacity-75 mt-2">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
        {!earned && progress && (
          <div className="mt-2">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BadgeCard;
