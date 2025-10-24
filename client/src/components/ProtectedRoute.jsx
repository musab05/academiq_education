import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      navigate('/dashboard');
    }
  }, [currentUser, allowedRoles, navigate]);

  if (!currentUser) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
