import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';
import { Menu, Bell, User, Save, FileText, ArrowLeft, Settings } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { notificationAPI } from '../services/api';

const Header = ({ 
  mode = 'default', // 'default', 'lesson-edit', 'course-overview', or 'preview'
  lessonTitle = '',
  title = '',
  onLessonTitleChange = () => {},
  onSave = () => {},
  onRevert = () => {},
  onBack = () => {},
  onMenuClick = () => {},
  onSettingsClick = () => {},
  saving = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications({ limit: 5 });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (mode === 'lesson-edit') {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <FileText className="w-5 h-5 text-gray-600" />
            <input
              value={lessonTitle}
              onChange={(e) => onLessonTitleChange(e.target.value)}
              className="text-lg font-medium bg-transparent border-none outline-none flex-1"
              placeholder="Lesson title..."
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Lesson Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onRevert}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Revert
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className={`px-4 py-2 text-white rounded-md text-sm flex items-center gap-2 ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  }

  if (mode === 'course-overview' || mode === 'preview') {
    return (
      <header className="bg-white">
        <div className="px-1 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={mode === 'preview' ? onBack : onMenuClick}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                {mode === 'preview' ? (
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {title || 'Course Overview'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-2 sm:w-80 max-w-md bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-3 sm:px-4 py-2 border-b">
                      <h3 className="text-xs sm:text-sm font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification._id} 
                            className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              setShowNotifications(false);
                              if (notification.link) navigate(notification.link);
                            }}
                          >
                            <p className="text-xs sm:text-sm text-gray-900 font-medium truncate">{notification.title}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{getTimeAgo(notification.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-3 sm:px-4 py-2 border-t">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 tap-target"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => { console.log('Profile Link clicked, navigating to /profile'); setShowProfile(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    
                    <Link to="/profile/settings" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {mode !== 'preview' && (
          <div className="px-1">
            <Breadcrumb />
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="bg-white">
      <div className="px-1 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {location.pathname === '/categories' ? 'Categories' : 
               location.pathname === '/courses' ? 'Courses' :
               location.pathname === '/my-courses' ? 'My Courses' :
               location.pathname === '/all-courses' ? 'All Courses' :
               location.pathname === '/my-reports' ? 'My Reports' :
               location.pathname === '/classrooms' ? 'Classrooms' :
               location.pathname === '/my-classrooms' ? 'My Classrooms' :
               location.pathname === '/browse-classrooms' ? 'Browse Classrooms' :
               location.pathname === '/users' ? 'Users' :
               location.pathname === '/instructors' ? 'Instructors' :
               location.pathname === '/students' ? 'Students' :
               location.pathname === '/teams' ? 'Teams' :
               location.pathname === '/departments' ? 'Departments' :
               location.pathname === '/certificates' ? 'Certificates' :
               location.pathname === '/events' ? 'Events' :
               location.pathname === '/reports' ? 'Reports' :
               location.pathname === '/settings' ? 'Settings' :
               location.pathname === '/earnings' ? 'Earnings' :
               location.pathname === '/profile' ? 'Profile' :
               'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-2 sm:w-80 max-w-md bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-3 sm:px-4 py-2 border-b">
                    <h3 className="text-xs sm:text-sm font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification._id} 
                          className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            setShowNotifications(false);
                            if (notification.link) navigate(notification.link);
                          }}
                        >
                          <p className="text-xs sm:text-sm text-gray-900 font-medium truncate">{notification.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{getTimeAgo(notification.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-3 sm:px-4 py-2 border-t">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/notifications');
                      }}
                      className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 tap-target"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link to="/profile" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <Link to="/profile/settings" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="px-1">
        <Breadcrumb />
      </div>
    </header>
  );
};

export default Header;
