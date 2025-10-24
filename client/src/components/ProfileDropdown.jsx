import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { logout } from '../store/slices/userSlice';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile/settings');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium">{user.firstName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <button
            onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4" />
            Profile Settings
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
