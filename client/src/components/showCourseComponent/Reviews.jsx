import React from 'react';
import { FiStar } from 'react-icons/fi';

const Reviews = ({ reviews }) => (
  <div className="space-y-4">
    {reviews.map((r, idx) => (
      <div key={idx} className="p-4 border rounded-md">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center">U</div>
          <div>
            <div className="text-sm font-medium">{r.name}</div>
            <div className="text-xs text-gray-500">{r.date}</div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-sm text-orange-500">
            <FiStar /> <span>{r.rating}</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-700">{r.text}</div>
      </div>
    ))}
  </div>
);

export default Reviews;