import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

const ThreeDotMenu = ({ onRename, onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="hover:bg-gray-100 p-1 rounded"
        onClick={() => setOpen(prev => !prev)}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-10 bg-white border shadow rounded text-sm w-32">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onRename();
              setOpen(false);
            }}
            className="w-full px-4 py-2 hover:bg-gray-100"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ThreeDotMenu;