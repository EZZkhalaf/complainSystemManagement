import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { hasPermission } from "../../utils/AuthHooks";
import { CiSettings } from "react-icons/ci";

const EmployeeNavLinks = ({ handleLogout }) => {
  const { user } = useAuthContext();
  const navLinkBase =
    "flex items-center  gap-2 text-slate-300 px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-blue-700 truncate mt-3 w-full";
  const activeLinkStyles = "bg-blue-800 text-white shadow-inner";
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-2">
        <NavLink
          to="/userPage/"
          end
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/userPage/add-complaint"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          Add Complaint
        </NavLink>

        <NavLink
          to={`/userPage/list-complaints/${user._id}`}
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          My Complaints
        </NavLink>

        <NavLink
          to="/userPage/current-groups"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          View Joined Groups
        </NavLink>

        {hasPermission(user, "view_groups") && (
          <NavLink
            to="/userPage/groups"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            Manage Groups
          </NavLink>
        )}

        {hasPermission(user, "view_employees") && (
          <NavLink
            to="/userPage/listEmployees"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            Manage Employees
          </NavLink>
        )}

        {hasPermission(user, "view_logs") && (
          <NavLink
            to="/userPage/view-logs"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            View Activity
          </NavLink>
        )}

        <NavLink
          to="/userPage/groupsForComplaints/"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          View Groups Complaints
        </NavLink>

        <NavLink
          to="/userPage/leaves"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
          }
        >
          Leaves
        </NavLink>

        {hasPermission(user, "view-leaves") && (
          <NavLink
            to="/userPage/leaves/manage"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? activeLinkStyles : ""}`
            }
          >
            Manage Leaves
          </NavLink>
        )}
      </div>

      {/* Bottom: settings + logout */}
      <div className="flex flex-col gap-2 mt-6">
        <NavLink
          to="/userPage/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-blue-700 hover:text-white"
            }`
          }
        >
          <CiSettings className="w-5 h-5" />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default EmployeeNavLinks;
