import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';
import { IoMdClose, IoMdMenu } from 'react-icons/io';
import { CiSettings } from 'react-icons/ci';





const AdminSideBar = ({isOpen , onClose}) => {
    const { user ,  logout} = useAuthContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.()
  };
  const navLinkBase =
  'flex items-center  gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate mt-5 w-full';

  const activeLinkStyles = 'bg-blue-800 text-white shadow-inner';

    const navLinks = (
      <div className="flex flex-col min-h-screen justify-between fixed">
        {/* Top nav links */}
        <div className="flex flex-col gap-2">
          <NavLink
            to="/adminPage/"
            end
            className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
          >
            <span>Summary</span>
          </NavLink>

          <NavLink
            to="/adminPage/complaints"
            className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
          >
            <span>List Complaints</span>
          </NavLink>

          {hasPermission(user, 'view_groups') && (
            <NavLink
              to="/adminPage/groups"
              className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
            >
              <span>List Groups</span>
            </NavLink>
          )}

          {hasPermission(user, 'view_groups') && (
            <NavLink
              to="/adminPage/listEmployees"
              className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
            >
              <span>Manage Employees</span>
            </NavLink>
          )}

          <NavLink
            to="/adminPage/manageRoles"
            className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
          >
            <span>Manage Roles</span>
          </NavLink>

          {hasPermission(user, 'view_logs') && (
            <NavLink
              to="/adminPage/view-logs"
              className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
            >
              <span>View Activity</span>
            </NavLink>
          )}

          <NavLink
            to="/adminPage/groupsForComplaints/"
            className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
          >
            <span>View Groups Complaints</span>
          </NavLink>

          <NavLink
            to="/adminPage/ComplaintGroupsRule"
            className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
          >
            <span>Manage Complaint Groups</span>
          </NavLink>
        </div>

        {/* Bottom: settings + logout */}
        <div className="flex flex-row gap-3  mb-25">
          <NavLink
            to={user.role === 'admin' ? '/adminPage/settings' : '/userPage/settings'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-blue-700 hover:text-white'
              }`
            }
            title="Settings"
          >
            <CiSettings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Logout
          </button>
        </div>
      </div>
    );


  return (
    <>

      {/* Overlay (background) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-none bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50  
          bg-slate-900 flex flex-col justify-between
          p-3 shadow-lg overflow-y-hidden
          min-w-[150px] max-w-[250px]
          w-64 sm:w-56 md:w-60 lg:static lg:h-auto lg:translate-x-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {navLinks}
      </aside>
    </>
  );
};

export default AdminSideBar;