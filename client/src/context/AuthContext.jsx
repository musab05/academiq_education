import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserSession, clearUserSession } from '../store/slices/userSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.user);

  const login = (userData, authToken) => {
    dispatch(setUserSession({ user: userData, token: authToken }));
  };

  const logout = () => {
    dispatch(clearUserSession());
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};