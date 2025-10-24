import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader } from 'lucide-react';
import { chatbotAPI } from '../../services/api';

const LearningAssistant = ({ lessonId, courseId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await chatbotAPI.generateContent({
        prompt: userMessage,
        lessonId,
        courseId,
        strictMode: true
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.content,
        hasContext: res.data.hasContext 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 hover:scale-110"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">Academiq Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                <p className="text-sm font-medium">Welcome!</p>
                <p className="text-xs mt-2">I'm here to help you with this course. Ask me anything related to the lessons!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : msg.error 
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader className="w-4 h-4 animate-spin text-orange-500" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the course..."
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LearningAssistant;
