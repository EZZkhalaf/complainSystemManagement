

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';
import { CiSettings } from 'react-icons/ci';

const EmployeeSideBar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const navLinkBase =
    'flex items-center gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate mt-5 w-full';
  const activeLinkStyles = 'bg-blue-800 text-white shadow-inner';

  const navLinks = (
    <div className="flex flex-col min-h-screen justify-between fixed">
      {/* Top nav links */}
      <div className="flex flex-col gap-2">
        <NavLink
          to="/userPage/"
          end
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/userPage/add-complaint"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>Add Complaint</span>
        </NavLink>

        <NavLink
          to={`/userPage/list-complaints/${user._id}`}
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>My Complaints</span>
        </NavLink>

        <NavLink
          to="/userPage/current-groups"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>View Joined Groups</span>
        </NavLink>

        {hasPermission(user, 'view_groups') && (
          <NavLink
            to="/userPage/groups"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
            }
          >
            <span>Manage Groups</span>
          </NavLink>
        )}

        {hasPermission(user, 'view_employees') && (
          <NavLink
            to="/userPage/listEmployees"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
            }
          >
            <span>Manage Employees</span>
          </NavLink>
        )}

        {hasPermission(user, 'view_logs') && (
          <NavLink
            to="/userPage/view-logs"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
            }
          >
            <span>View Activity</span>
          </NavLink>
        )}

        <NavLink
          to="/userPage/groupsForComplaints/"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>View Groups Complaints</span>
        </NavLink>
      </div>

      {/* Bottom: settings + logout */}
      <div className="flex flex-row gap-3 mb-25">
        <NavLink
          to="/userPage/settings"
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
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-none bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          bg-slate-900 flex flex-col justify-between
          p-3 shadow-lg overflow-y-auto
          min-w-[150px] max-w-[250px]
          w-full sm:w-44 md:w-48 lg:w-[14vw] xl:w-[12vw]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>{navLinks}</div>
      </aside>
    </>
  );
};

export default EmployeeSideBar;
