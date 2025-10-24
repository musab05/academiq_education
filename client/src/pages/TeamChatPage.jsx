import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Video, Phone, MoreVertical, Users, Paperclip, Smile, Play } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { teamAPI } from '../services/api';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

const TeamChatPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [team, setTeam] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTeam();
    fetchMessages();

    socket.emit('join-team-chat', { teamId, userId: user._id });

    socket.on('team-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.emit('leave-team-chat', { teamId });
      socket.off('team-message');
    };
  }, [teamId]);

  const fetchMessages = async () => {
    try {
      const response = await teamAPI.getMessages(teamId);
      const formattedMessages = response.data.map(msg => ({
        id: msg._id,
        userId: msg.sender._id,
        userName: `${msg.sender.firstName} ${msg.sender.lastName}`,
        profilePicture: msg.sender.profilePicture,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTeam = async () => {
    try {
      const response = await teamAPI.getTeams();
      const foundTeam = response.data.find(t => t._id === teamId);
      setTeam(foundTeam);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await teamAPI.sendMessage(teamId, { text: message });
      const newMessage = {
        id: response.data._id,
        userId: response.data.sender._id,
        userName: `${response.data.sender.firstName} ${response.data.sender.lastName}`,
        profilePicture: response.data.sender.profilePicture,
        text: response.data.text,
        time: new Date(response.data.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      socket.emit('team-message', { teamId, message: newMessage });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartMeeting = () => {
    navigate(`/teams/${teamId}/meeting`);
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <motion.div 
        animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block sidebar-scroll sticky top-0 h-screen overflow-y-auto bg-white shadow-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />

        <div className="flex-1 flex flex-col bg-white m-2 sm:m-4 md:m-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => navigate('/teams')}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{team.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500">{team.members.length} members</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleStartMeeting}
                  className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors tap-target text-sm"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden md:inline">Start Meeting</span>
                </button>
                <button
                  onClick={handleStartMeeting}
                  className="sm:hidden p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors tap-target"
                  title="Start Meeting"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/teams/${teamId}/recordings`)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
                  title="Recordings"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="hidden sm:block p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target">
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.userId === user._id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.userId !== user._id && msg.profilePicture && (
                  <img
                    src={msg.profilePicture}
                    alt={msg.userName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 mt-1"
                  />
                )}
                <div className={`max-w-[75%] sm:max-w-md ${msg.userId === user._id ? 'order-2' : 'order-1'}`}>
                  {msg.userId !== user._id && (
                    <p className="text-xs text-gray-500 mb-1 ml-2">{msg.userName}</p>
                  )}
                  <div
                    className={`px-3 sm:px-4 py-2 rounded-2xl break-words ${
                      msg.userId === user._id
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-xs sm:text-sm">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-2">{msg.time}</p>
                </div>
                {msg.userId === user._id && user.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt="You"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 mt-1"
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-2 sm:p-3 md:p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              />
              <button
                type="button"
                className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tap-target"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChatPage;
