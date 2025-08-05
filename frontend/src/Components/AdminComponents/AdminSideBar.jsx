import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';
import { IoMdClose, IoMdMenu } from 'react-icons/io';





const AdminSideBar = () => {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinkBase =
  'flex items-center  gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate';

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

      {hasPermission(user, 'view logs') && (
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
    </>
  );

  return (
    <>
      

      {/* <aside className="md:flex w-[10vw] min-w-[190px] max-w-[400px] bg-slate-900 min-h-screen flex-col p-3 space-y-2 shadow-lg"> */}
      <aside className="md:flex w-[15vw] min-w-[190px] max-w-[400px] bg-slate-900 min-h-screen flex-col p-3 space-y-2 shadow-lg overflow-y-auto ">

          {navLinks}
      </aside>

      
    </>
  );
};

export default AdminSideBar;
