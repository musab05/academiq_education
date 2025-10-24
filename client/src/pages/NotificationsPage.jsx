import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/Header';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to load notifications' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to mark as read' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showNotification({ type: 'success', message: 'All notifications marked as read' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to mark all as read' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      showNotification({ type: 'success', message: 'Notification deleted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete notification' });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      enrollment: 'bg-blue-100 text-blue-600',
      assignment: 'bg-purple-100 text-purple-600',
      grade: 'bg-green-100 text-green-600',
      comment: 'bg-yellow-100 text-yellow-600',
      course: 'bg-orange-100 text-orange-600',
      classroom: 'bg-indigo-100 text-indigo-600',
      team: 'bg-pink-100 text-pink-600',
      achievement: 'bg-amber-100 text-amber-600',
      system: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || colors.system;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header mode="default" title="Notifications" onBack={() => navigate(-1)} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header mode="default" title="Notifications" onBack={() => navigate(-1)} />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiBell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                </select>
                
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors tap-target"
                  >
                    <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <FiBell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No notifications</h3>
                <p className="text-xs sm:text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                      <FiBell className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{notification.message}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification._id);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded tap-target"
                              title="Mark as read"
                            >
                              <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification._id);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded tap-target"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
