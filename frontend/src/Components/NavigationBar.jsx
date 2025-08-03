import React, { useState } from 'react';
import { useAuthContext } from '../Context/authContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { CiSettings } from 'react-icons/ci';
import defaultPhoto from '../assets/defaultPhoto.png';

const NavigationBar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profilePicture = user.profilePicture
    ? `http://localhost:5000${user.profilePicture}`
    : defaultPhoto;

  return (
    <nav className="bg-slate-900 text-slate-300 px-6 py-3 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side: Profile */}
        <div className="flex items-center gap-4">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-sm"
          />
          <div className=" sm:block">
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-blue-400 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Right side: desktop menu */}
        <div className=" md:flex items-center gap-6">
          <NavLink
            to={user.role === 'admin' ? '/adminPage/settings' : '/userPage/settings'}
            className={({ isActive }) =>
              `flex items-center gap-1 px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-300 hover:bg-blue-700 hover:text-white'
              }`
            }
            title="Settings"
          >
            <CiSettings className="w-6 h-6" />
            <span className="hidden lg:inline">Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-300 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 bg-slate-800 rounded-md shadow-lg p-4 space-y-4">
          <NavLink
            to={user.role === 'admin' ? '/adminPage/settings' : '/userPage/settings'}
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 rounded-md text-slate-300 hover:bg-blue-700 hover:text-white transition"
          >
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
