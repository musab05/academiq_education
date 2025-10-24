import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Save, Upload } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNotification } from '../context/NotificationContext';
import { setTemplate, setLoading } from '../store/slices/certificateSlice';
import api from '../services/api';
import certificateImg from '../public/images/certificate.png';

const CertificateDesignerPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const dispatch = useDispatch();
  const { template } = useSelector((state) => state.certificate);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fields, setFields] = useState([
    { id: 'name', label: 'Student Name', x: 400, y: 300, fontSize: 32, text: 'John Doe', dragging: false },
    { id: 'course', label: 'Course Name', x: 400, y: 380, fontSize: 24, text: 'Web Development', dragging: false },
    { id: 'date', label: 'Date', x: 400, y: 450, fontSize: 20, text: new Date().toLocaleDateString(), dragging: false },
  ]);
  const [selectedField, setSelectedField] = useState('name');
  const [uploadedImage, setUploadedImage] = useState(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        dispatch(setLoading(true));
        const response = await api.get('/api/certificates/template');
        if (response.data) {
          dispatch(setTemplate(response.data));
          const loadedFields = response.data.fields.map(f => ({ ...f, text: f.label, dragging: false }));
          setFields(loadedFields);
          setTemplates([response.data]);
          setSelectedTemplate(response.data._id);
          setSelectedField(loadedFields[0]?.id || 'name');
        }
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadTemplate();
  }, [dispatch]);

  const handleMouseDown = (e, fieldId) => {
    e.preventDefault();
    setSelectedField(fieldId);
    setFields(fields.map(f => f.id === fieldId ? { ...f, dragging: true } : f));
  };

  const handleMouseMove = (e) => {
    if (!selectedField) return;
    const field = fields.find(f => f.id === selectedField && f.dragging);
    if (!field) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFields(fields.map(f => f.id === selectedField ? { ...f, x, y } : f));
  };

  const handleMouseUp = () => {
    setFields(fields.map(f => ({ ...f, dragging: false })));
  };

  const updateFieldText = (fieldId, text) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, text } : f));
  };

  const updateFieldFontSize = (fieldId, fontSize) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, fontSize: parseInt(fontSize) } : f));
  };

  const saveTemplate = async () => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('fields', JSON.stringify(fields.map(({ id, label, x, y, fontSize }) => ({ id, label, x, y, fontSize }))));
      if (uploadedImage) {
        formData.append('templateImage', uploadedImage);
      } else {
        formData.append('templateImage', 'certificate.png');
      }
      const response = await api.post('/api/certificates/template', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(setTemplate(response.data));
      showNotification({ type: 'success', message: 'Template saved successfully!' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to save template' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.div 
        animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block sidebar-scroll sticky top-0 h-screen overflow-y-auto bg-white shadow-lg flex-shrink-0"
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => {
          if (window.innerWidth >= 1024) {
            setSidebarCollapsed(!sidebarCollapsed);
          } else {
            setSidebarOpen(true);
          }
        }} />
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Certificate Designer</h1>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="tap-target flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Upload Image</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadedImage(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button 
                    onClick={saveTemplate}
                    className="tap-target flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Save Template</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>
              </div>
              {templates.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Select Template:</label>
                  <select
                    value={selectedTemplate || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t._id === e.target.value);
                      if (template) {
                        setSelectedTemplate(template._id);
                        const loadedFields = template.fields.map(f => ({ ...f, text: f.label, dragging: false }));
                        setFields(loadedFields);
                        setSelectedField(loadedFields[0]?.id || 'name');
                      }
                    }}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  >
                    {templates.map((template, index) => (
                      <option key={template._id} value={template._id}>
                        Certificate Template {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                  <div 
                    ref={containerRef}
                    className="relative bg-gray-100 rounded-lg overflow-hidden touch-none"
                    style={{ width: '100%', maxWidth: '842px', aspectRatio: '842/595' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
                    }}
                    onTouchEnd={handleMouseUp}
                  >
                    <img 
                      src={uploadedImage ? URL.createObjectURL(uploadedImage) : certificateImg} 
                      alt="Certificate Template"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    {fields.map(field => (
                      <div
                        key={field.id}
                        className={`absolute cursor-move select-none tap-target ${selectedField === field.id ? 'ring-2 ring-orange-500' : ''}`}
                        style={{
                          left: `${field.x}px`,
                          top: `${field.y}px`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${field.fontSize}px`,
                          fontWeight: 'bold',
                          color: '#1f2937',
                          textShadow: '0 0 2px white',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, field.id)}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          handleMouseDown({ preventDefault: () => {}, clientX: touch.clientX, clientY: touch.clientY }, field.id);
                        }}
                        onClick={() => setSelectedField(field.id)}
                      >
                        {field.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Field Properties</h2>
                  {selectedField ? (
                    <div className="space-y-4">
                      {fields.filter(f => f.id === selectedField).map(field => (
                        <div key={field.id}>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={field.text}
                            onChange={(e) => updateFieldText(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                          />
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mt-3 mb-2">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={field.fontSize}
                            onChange={(e) => updateFieldFontSize(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                          />
                          <div className="mt-3 text-xs sm:text-sm text-gray-600">
                            <p>Position: X: {Math.round(field.x)}, Y: {Math.round(field.y)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm">Click on a field to edit its properties</p>
                  )}

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Available Fields</h3>
                    <div className="space-y-2">
                      {fields.map(field => (
                        <button
                          key={field.id}
                          onClick={() => setSelectedField(field.id)}
                          className={`tap-target w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedField === field.id 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium">{field.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDesignerPage;
