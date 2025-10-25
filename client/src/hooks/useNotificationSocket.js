import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateUser } from '../store/slices/userSlice';
import { useNotification } from '../context/NotificationContext';

let socket = null;

export const useNotificationSocket = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!user?._id) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
    }

    socket.emit('join-notifications', { userId: user._id });

    socket.on('new-notification', (notification) => {
      showNotification({
        type: 'success',
        message: notification.message,
      });
    });

    socket.on('role-updated', ({ role }) => {
      dispatch(updateUser({ role }));
      showNotification({
        type: 'success',
        message: `Your role has been updated to ${role}!`,
      });
    });

    return () => {
      if (socket) {
        socket.off('new-notification');
        socket.off('role-updated');
      }
    };
  }, [user?._id, dispatch, showNotification]);
};
