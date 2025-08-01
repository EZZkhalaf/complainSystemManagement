import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';

const AdminSideBar = () => {
  const navLinkStyles =
    'flex items-center gap-3 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-700';

    const {user} = useAuthContext();
  const activeLinkStyles = 'bg-blue-700';

  return (
    <div className="w-53 bg-blue-800 min-h-screen flex flex-col p-4 space-y-4">
      <NavLink
        to="/adminPage/"
        end
        className={({ isActive }) =>
          `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
        }
      >
        <span>Summary</span>
      </NavLink>


      <NavLink
        to="/adminPage/complaints"
        className={({ isActive }) =>
          `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
        }
      >
        <span>List Complaints</span>
      </NavLink>

        {hasPermission(user,"view_groups") &&(
          <NavLink
            to="/adminPage/groups"
            className={({ isActive }) =>
              `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
          >
            <span>List Groups</span>
          </NavLink>
         )} 
      
      {hasPermission(user,"view_groups") &&(
        <NavLink
          to="/adminPage/listEmployees"
          className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
          }
        >
          <span>Manage Employees</span>
        </NavLink>
       )}
      {hasPermission(user,"view_roles") &&
        <NavLink
            to="/adminPage/manageRoles"
            className={({ isActive }) =>
              `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
          >
            <span>Manage Roles</span>
          </NavLink>
        }
    </div>
  );
};

export default AdminSideBar;
