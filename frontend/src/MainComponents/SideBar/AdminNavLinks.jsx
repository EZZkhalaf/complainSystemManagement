import React from "react";
import { NavLink } from "react-router-dom";
import { hasPermission } from "../../utils/AuthHooks";
import { useAuthContext } from "../../Context/authContext";
import { CiSettings } from "react-icons/ci";

const AdminNavLinks = ({ handleLogout }) => {
  const { user } = useAuthContext();
  const navLinkBase =
    "flex items-center  gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate mt-3 w-full";

  const activeLinkStyles = "bg-blue-800 text-white shadow-inner";

  return (
    <div className="flex flex-col h-full justify-between ">
      <div className="flex flex-col gap-2">
        <NavLink
          to="/adminPage/"
          end
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          <span>Summary</span>
        </NavLink>

        <NavLink
          to="/adminPage/complaints"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          <span>List Complaints</span>
        </NavLink>

        {hasPermission(user, "view_groups") && (
          <NavLink
            to="/adminPage/groups"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            <span>List Groups</span>
          </NavLink>
        )}

        {hasPermission(user, "view_groups") && (
          <NavLink
            to="/adminPage/listEmployees"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            <span>Manage Employees</span>
          </NavLink>
        )}

        <NavLink
          to="/adminPage/manageRoles"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          <span>Manage Roles</span>
        </NavLink>

        {hasPermission(user, "view_logs") && (
          <NavLink
            to="/adminPage/view-logs"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            <span>View Activity</span>
          </NavLink>
        )}

        <NavLink
          to="/adminPage/groupsForComplaints/"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          <span>View Groups Complaints</span>
        </NavLink>

        <NavLink
          to="/adminPage/ComplaintGroupsRule"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          <span>Manage Complaint Groups</span>
        </NavLink>

        {hasPermission(user, "view-leaves") && (
          <NavLink
            to="/adminPage/leaves"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            <span>Manage Leaves</span>
          </NavLink>
        )}
      </div>

      {/* Bottom: settings + logout */}
      <div className="flex flex-row gap-3 ">
        <NavLink
          to={
            user.role === "admin" ? "/adminPage/settings" : "/userPage/settings"
          }
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-blue-700 hover:text-white"
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
};

export default AdminNavLinks;
