import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LOGO from '../public/images/whitelogofull.png';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { user } = useSelector(state => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthNavigation = (mode) => {
    if (mode === 'signup') {
      navigate('/auth?mode=signup');
    } else {
      navigate('/auth');
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Notice */}
      <div className="bg-[#FF5A00] text-white text-xs sm:text-sm text-center py-2 font-medium">
        Free Courses ⚡ Sale Ends Soon, Get It Now →
      </div>

      {/* Navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 shadow-md bg-white relative">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Logo */}
          <a href="/" className="p-1 sm:p-2 rounded-md cursor-pointer">
            <span className="bg-[#FF5A00] text-white font-bold text-xl">
              <img className="w-10 sm:w-12" src={LOGO} alt="Academiq" />
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            <a
              href="/"
              className={`px-2 xl:px-3 py-1 rounded text-sm ${location.pathname === '/' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:text-[#FF5A00]'}`}
            >
              Home
            </a>
            <a 
              href='/all-courses' 
              className={`px-2 xl:px-3 py-1 rounded text-sm ${location.pathname === '/all-courses' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:text-[#FF5A00]'}`}
            >
              Courses
            </a>
            <a 
              href='/all-classrooms' 
              className={`px-2 xl:px-3 py-1 rounded text-sm ${location.pathname === '/all-classrooms' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:text-[#FF5A00]'}`}
            >
              Classrooms
            </a>
            <a 
              href="/about" 
              className={`px-2 xl:px-3 py-1 rounded text-sm ${location.pathname === '/about' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:text-[#FF5A00]'}`}
            >
              About Us
            </a>
            <a 
              href="/contact" 
              className={`px-2 xl:px-3 py-1 rounded text-sm ${location.pathname === '/contact' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:text-[#FF5A00]'}`}
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/join-admin')}
            className="hidden sm:flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            <span className="text-base">⚡</span>
            Join
          </button>
          
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <button 
                onClick={() => handleAuthNavigation('signup')}
                className="hidden sm:block text-xs sm:text-sm text-black hover:text-[#FF5A00]"
              >
                Sign Up
              </button>
              <button 
                onClick={() => handleAuthNavigation('login')}
                className="bg-[#FF5A00] hover:bg-[#FFB088] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold transition"
              >
                Login
              </button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-[88px] right-0 w-64 bg-white shadow-lg z-50 lg:hidden">
            <nav className="flex flex-col p-4 space-y-2">
              <button
                onClick={() => { navigate('/join-admin'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <span>⚡</span>
                Join as Admin
              </button>
              <a
                href="/"
                className={`px-3 py-2 rounded ${location.pathname === '/' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href='/all-courses'
                className={`px-3 py-2 rounded ${location.pathname === '/all-courses' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </a>
              <a
                href='/all-classrooms'
                className={`px-3 py-2 rounded ${location.pathname === '/all-classrooms' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Classrooms
              </a>
              <a
                href="/about"
                className={`px-3 py-2 rounded ${location.pathname === '/about' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a
                href="/contact"
                className={`px-3 py-2 rounded ${location.pathname === '/contact' ? 'text-black font-semibold bg-gray-100' : 'text-black hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              {!user && (
                <button
                  onClick={() => handleAuthNavigation('signup')}
                  className="text-black hover:bg-gray-50 px-3 py-2 rounded lg:hidden w-full text-left"
                >
                  Sign Up
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
