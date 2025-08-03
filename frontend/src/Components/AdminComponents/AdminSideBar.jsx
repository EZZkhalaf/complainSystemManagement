import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';

const AdminSideBar = () => {
  const navLinkBase = 'flex items-center gap-3 text-slate-300 px-5 py-3 rounded-lg transition-colors duration-200 hover:bg-blue-700';
  const activeLinkStyles = 'bg-blue-800 text-white shadow-inner';

  const { user } = useAuthContext();

  return (
    <aside className="w-56 bg-slate-900 min-h-screen flex flex-col p-6 space-y-4 shadow-lg">
      <NavLink
        to="/adminPage/"
        end
        className={({ isActive }) =>
          `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
        }
      >
        <span>Summary</span>
      </NavLink>

      <NavLink
        to="/adminPage/complaints"
        className={({ isActive }) =>
          `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
        }
      >
        <span>List Complaints</span>
      </NavLink>

      {hasPermission(user, "view_groups") && (
        <NavLink
          to="/adminPage/groups"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>List Groups</span>
        </NavLink>
      )}

      {hasPermission(user, "view_groups") && (
        <NavLink
          to="/adminPage/listEmployees"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>Manage Employees</span>
        </NavLink>
      )}

      {hasPermission(user, "view_roles") && (
        <NavLink
          to="/adminPage/manageRoles"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>Manage Roles</span>
        </NavLink>
      )}
    </aside>
  );
};

export default AdminSideBar;
