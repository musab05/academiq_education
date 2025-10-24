import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

const BlockCard = ({ block, onUpdate, onDelete, onVideoUpload }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/);
      return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : '';
    }
    return '';
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full text-2xl font-bold bg-transparent border-none outline-none"
            placeholder="Enter heading..."
          />
        );
      case 'paragraph':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full bg-transparent border-none outline-none resize-none min-h-[100px]"
            placeholder="Start writing..."
          />
        );
      case 'video':
        return (
          <div className="space-y-3">
            {!block.content ? (
              <div className="space-y-3">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative"
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                      onVideoUpload(file, block.id);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <p className="text-gray-500 mb-2">Drop video here or click to upload</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => onVideoUpload(e.target.files[0], block.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-center text-gray-400 text-sm">or</div>
                <input
                  type="url"
                  placeholder="Enter YouTube or Vimeo URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  onBlur={(e) => {
                    if (e.target.value) {
                      onUpdate(block.id, { content: e.target.value });
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded">
                  {block.content.startsWith('http') && (block.content.includes('youtube') || block.content.includes('vimeo')) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getEmbedUrl(block.content)}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      width="100%"
                      height="100%"
                      controls
                      src={block.content}
                      className="w-full h-full rounded"
                    />
                  )}
                </div>
                <button
                  onClick={() => onUpdate(block.id, { content: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Video
                </button>
              </div>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter image URL..."
            />
            <img src={block.content} alt="Block content" className="max-w-full h-auto rounded" />
          </div>
        );
      case 'list':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full bg-transparent border-none outline-none resize-none min-h-[80px]"
            placeholder="Enter list items (one per line)..."
          />
        );
      case 'code':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full bg-gray-900 text-green-400 font-mono p-3 rounded border-none outline-none resize-none min-h-[100px]"
            placeholder="Enter your code..."
          />
        );
      case 'quote':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full bg-gray-50 border-l-4 border-orange-500 pl-4 py-2 italic outline-none resize-none min-h-[60px]"
            placeholder="Enter quote..."
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-2">
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <div className="flex-1">
          {renderBlockContent()}
        </div>
        <button
          onClick={() => onDelete(block.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 mt-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default BlockCard;