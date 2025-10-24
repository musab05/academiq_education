import React from 'react';
import { Type, Video, Image, List, Code, Quote } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Text', icon: Type },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'list', label: 'List', icon: List },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'quote', label: 'Quote', icon: Quote }
];

const BlockSidebar = ({ onAddBlock }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Blocks</h3>
      <div className="space-y-2">
        {BLOCK_TYPES.map((blockType) => (
          <button
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <blockType.icon size={16} />
            {blockType.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlockSidebar;