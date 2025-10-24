import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, List } from 'lucide-react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import CreateEventModal from '../components/event/CreateEventModal';
import EventTable from '../components/event/EventTable';
import EventCalendar from '../components/event/EventCalendar';
import EventDetailsModal from '../components/event/EventDetailsModal';
import { eventAPI, userAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const EventManagementPage = () => {
  const { user } = useSelector(state => state.user);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState('calendar'); // calendar or table
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification({ type: 'error', message: 'Failed to fetch events' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = (date = null) => {
    setEditing(null);
    if (date) {
      // Pre-fill with selected date
      const startDate = new Date(date);
      startDate.setHours(9, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(10, 0, 0, 0);
      setEditing({ startDate, endDate });
    }
    setIsModalOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };



  const handleEdit = (event) => {
    setEditing(event);
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      setCreating(true);
      if (editing) {
        await eventAPI.updateEvent(editing._id, eventData);
        showNotification({ type: 'success', message: 'Event updated successfully' });
      } else {
        await eventAPI.createEvent(eventData);
        showNotification({ type: 'success', message: 'Event created successfully' });
      }
      setIsModalOpen(false);
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to save event' 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete event?')) return;
    setLoading(true);
    try {
      await eventAPI.deleteEvent(id);
      showNotification({ type: 'success', message: 'Event deleted' });
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification({
        type: 'error',
        message: error?.response?.data?.error || 'Delete failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventAPI.registerForEvent(eventId, {});
      showNotification({ type: 'success', message: 'Registered for event successfully' });
      await fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      showNotification({
        type: 'error',
        message: error?.response?.data?.error || 'Registration failed',
      });
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <div className="hidden lg:block">
        <motion.div 
          animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="sidebar-scroll sticky top-0 h-screen overflow-y-auto bg-white shadow-lg"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </motion.div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(true);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />
        
        <div className="flex flex-1">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Event Management</h2>
                  {loading && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Loading...</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setView('calendar')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center justify-center gap-1 tap-target ${
                        view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Calendar</span>
                    </button>
                    <button
                      onClick={() => setView('table')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center justify-center gap-1 tap-target ${
                        view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm text-sm sm:text-base tap-target"
                    onClick={() => handleCreate()}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Event</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                </div>
              </div>

              {view === 'calendar' ? (
                <EventCalendar
                  events={events}
                  onEventClick={handleEventClick}
                  onCreateEvent={handleCreate}
                />
              ) : (
                <EventTable
                  events={events}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRegister={handleRegister}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateEvent={handleCreateEvent}
        loading={creating}
        users={users}
        event={editing}
      />

      <EventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        event={selectedEvent}
        onEdit={handleEdit}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default EventManagementPage;