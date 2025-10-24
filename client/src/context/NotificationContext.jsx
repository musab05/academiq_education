// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../common/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    ({ type = 'info', message, duration = 3000 }) => {
      setNotification({ type, message, duration });

      setTimeout(() => {
        setNotification(null);
      }, duration);
    },
    []
  );

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
