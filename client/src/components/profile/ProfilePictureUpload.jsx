import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Upload, X, Check } from 'lucide-react';

const ProfilePictureUpload = ({ profilePicture, onUpdate, onReset, loading }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const minDim = Math.min(img.width, img.height);
    setImageSize({ width: img.width, height: img.height });
    setCropBox({ x: 0, y: 0, size: minDim });
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 300;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    ctx.drawImage(
      image,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.size * scaleX,
      cropBox.size * scaleY,
      0, 0, 300, 300
    );
    
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onUpdate(croppedImage);
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleCropMouseDown = (e, action) => {
    e.stopPropagation();
    if (action === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropBox.x, y: e.clientY - cropBox.y });
    } else if (action === 'resize') {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY, size: cropBox.size });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageSize.width - cropBox.size));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageSize.height - cropBox.size));
      setCropBox({ ...cropBox, x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const delta = Math.max(deltaX, deltaY);
      const minDim = Math.min(imageSize.width, imageSize.height);
      const newSize = Math.min(Math.max(100, dragStart.size + delta), minDim, imageSize.width - cropBox.x, imageSize.height - cropBox.y);
      setCropBox({ ...cropBox, size: newSize });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Profile Picture</h2>
        
        <div className="text-center">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-3 sm:mb-4 border-4 border-gray-200 object-cover"
          />
          
          <div className="space-y-2 sm:space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <input
              type="url"
              placeholder="Or enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm"
            />
            
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Choose File"
                className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-[#FF5A00] text-white rounded-lg hover:bg-orange-600 text-xs sm:text-sm tap-target"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <button
                onClick={() => onUpdate(imageUrl)}
                disabled={loading.picture || !imageUrl}
                title="Update Picture"
                className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-[#FF5A00] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-xs sm:text-sm tap-target"
              >
                {loading.picture ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Camera className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              
              <button
                onClick={onReset}
                disabled={loading.reset}
                title="Reset to Default"
                className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-xs sm:text-sm tap-target"
              >
                {loading.reset ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center p-3 sm:p-4 text-white">
              <h3 className="text-base sm:text-lg font-semibold">Crop Image</h3>
              <button onClick={() => { setShowCropModal(false); setSelectedImage(null); }} className="text-white hover:text-gray-300 tap-target">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-auto">
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="select-none max-w-full max-h-[70vh]"
                />
                <div
                  className="absolute border-4 border-[#FF5A00] cursor-move"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.size}px`,
                    height: `${cropBox.size}px`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'
                  }}
                  onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                >
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#FF5A00] cursor-nwse-resize"
                    onMouseDown={(e) => handleCropMouseDown(e, 'resize')}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 p-3 sm:p-4">
              <button
                onClick={() => { setShowCropModal(false); setSelectedImage(null); }}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base tap-target"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#FF5A00] text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base tap-target"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default ProfilePictureUpload;
