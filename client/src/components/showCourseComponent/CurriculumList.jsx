import React from 'react';
import { FiPlay } from 'react-icons/fi';

const CurriculumList = ({ lessons }) => (
  <ul className="space-y-3 mt-4">
    {lessons.map((l, idx) => (
      <li key={idx} className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded p-2"><FiPlay /></div>
          <div>
            <div className="text-sm font-medium">{l.title}</div>
            <div className="text-xs text-gray-500">{l.duration}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">{l.type}</div>
      </li>
    ))}
  </ul>
);

export default CurriculumList;