import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveUserSession,
  clearUserSession,
  getUserSession,
} from '../common/Session';
import { useDispatch, useSelector } from 'react-redux';
import { setUserSession } from '../store/slices/userSlice';

import { useNotification } from '../context/NotificationContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

const roles = ['student', 'instructor'];

const AuthForm = () => {
  const token = useSelector(state => state.user.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check URL parameters to set initial form mode
  const modeParam = searchParams.get('mode');
  const [isSignIn, setIsSignIn] = useState(modeParam !== 'signup');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [requestedInstructorRole, setRequestedInstructorRole] = useState(false);

  const handleToggle = () => {
    const newMode = !isSignIn;
    setIsSignIn(newMode);
    setError('');
    
    // Update URL parameters
    if (newMode) {
      // Switching to sign in
      searchParams.delete('mode');
    } else {
      // Switching to sign up
      searchParams.set('mode', 'signup');
    }
    setSearchParams(searchParams);
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, role } =
      formData;

    if (isSignIn) {
      if (!email || !password) return setError('All fields are required');
    } else {
      if (!firstName || !lastName || !email || !password || !confirmPassword)
        return setError('All fields are required');

      if (!roles.includes(role)) return setError('Invalid role selected');

      if (!emailRegex.test(email)) return setError('Invalid email format');

      if (!passwordRegex.test(password))
        return setError(
          'Password must be 8+ chars, include uppercase, lowercase, number, and symbol'
        );

      if (password !== confirmPassword)
        return setError("Passwords don't match");
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/auth/${isSignIn ? 'signin' : 'signup'
        }`;
      
      // If user selected instructor role, register as student but flag for instructor request
      const isInstructorRequest = !isSignIn && role === 'instructor';
      const actualRole = isInstructorRequest ? 'student' : role;
      
      const payload = isSignIn
        ? { emailOrUsername: email, password }
        : {
          firstName,
          lastName,
          email,
          password,
          role: actualRole,
          instructorRequest: isInstructorRequest, // Flag for backend to handle
        };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) return setError(data.error || 'Something went wrong');

      dispatch(setUserSession({ token: data.token, user: data.user }));
      
      // Show appropriate success message
      let successMessage = `${isSignIn ? 'Logged in' : 'Registered'} successfully!`;
      if (isInstructorRequest) {
        successMessage = 'Account created successfully! Your instructor role request has been sent to the admin for approval.';
      }
      
      showNotification({
        type: 'success',
        message: successMessage,
      });

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error(err);
      showNotification({
        type: 'error',
        message: err.message || 'Network error',
      });
    }
  };

  useEffect(() => {
    if (token) {
      console.log('User is already logged in, redirecting...');
      navigate('/');
    }
  }, [token, navigate]);

  // Update form mode when URL parameters change
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    setIsSignIn(modeParam !== 'signup');
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {isSignIn ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && (
          <div className="text-red-600 text-sm text-center mb-2">{error}</div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={isSignIn ? 'signin' : 'signup'}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {!isSignIn && (
              <>
                <div className='flex gap-2'>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    onChange={handleChange}
                    value={formData.role}
                    className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formData.role === 'instructor' && (
                    <p className="text-sm text-blue-600 mt-1">
                      📝 Note: Instructor accounts require admin approval. You'll be registered as a student initially and notified once approved.
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                placeholder="••••••••"
              />
            </div>

            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#ff7225]"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#FF5A00] text-white py-2 rounded-lg hover:bg-[#ffb58d] transition duration-300"
            >
              {isSignIn ? 'Login' : 'Create Account'}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={handleToggle}
              className="text-[#FF5A00] ml-1 hover:underline font-medium"
            >
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
