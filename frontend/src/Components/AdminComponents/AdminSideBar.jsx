import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';
import { IoMdClose, IoMdMenu } from 'react-icons/io';





const AdminSideBar = () => {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinkBase =
  'flex items-center gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate';

  const activeLinkStyles = 'bg-blue-800 text-white shadow-inner';

  const navLinks = (
    <>
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

      {hasPermission(user, 'view_roles') && (
        <NavLink
          to="/adminPage/manageRoles"
          className={({ isActive }) => `${navLinkBase} ${isActive ? activeLinkStyles : ''}`}
        >
          <span>Manage Roles</span>
        </NavLink>
      )}
    </>
  );

  return (
    <>
      

      {/* Desktop sidebar (visible md and up) */}
      <aside className="md:flex w-[10vw] min-w-[180px] max-w-[400px] bg-slate-900 min-h-screen flex-col p-3 space-y-2 shadow-lg">
    
          {navLinks}
      </aside>

      
    </>
  );
};

export default AdminSideBar;
