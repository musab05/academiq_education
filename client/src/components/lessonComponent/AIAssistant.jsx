import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader } from 'lucide-react';
import { chatbotAPI } from '../../services/api';

const AIAssistant = ({ lessonId, courseId, editorRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await chatbotAPI.generateContent({
        prompt: prompt.trim(),
        lessonId,
        courseId
      });

      const htmlContent = res.data.content
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');
      
      if (editorRef?.current) {
        editorRef.current.insertContent(htmlContent);
      }
      
      setPrompt('');
      setIsOpen(false);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to generate content'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(236, 72, 153, 0.6)', '0 0 20px rgba(168, 85, 247, 0.4)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-8 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me to generate content, explain concepts, or get information from the lesson..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
