import React from 'react'
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { CiSettings } from "react-icons/ci";
import { hasPermission } from '../../utils/AuthHooks';

const EmployeeSideBar = () => {
    const {user} = useAuthContext();
  const navLinkStyles =
        'flex items-center gap-3 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-700';

    const activeLinkStyles = 'bg-blue-700';
  return (
    <div className='w-60 bg-blue-800 min-h-screen flex flex-col p-4 space-y-4"'>
        
        
        <NavLink 
            to={"/userPage/"}
            end
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                Home
            </span>
        </NavLink>
            
        {hasPermission(user,"add_complaint") && 
            <NavLink 
                to={"/userPage/add-complaint"}
                className={({ isActive }) =>
                `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
                }
            >
                <span>
                    Add Complaint
                </span>
            </NavLink>
        }
        <NavLink 
            to={`/userPage/list-complaints/${user._id}`}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                My Complaints
            </span>
        </NavLink>


            {hasPermission(user,"view_complaints") && 
                <NavLink 
                to={"/userPage/complaints"}
                className={({ isActive }) =>
                `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
                }
                >
                    <span>
                        View Other's Complaints
                    </span>
                </NavLink>
            }
        <NavLink 
            to={"/userPage/current-groups"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                View Joined Groups
            </span>
        </NavLink>

        {hasPermission(user,"view_groups") &&
            <NavLink 
                to={"/userPage/groups"}
                className={({ isActive }) =>
                `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
                }
            >
                <span>
                    Manage Groups
                </span>
            </NavLink>
        }


        {hasPermission(user,"view_employees") &&(
            <NavLink
            to="/userPage/listEmployees"
            className={({ isActive }) =>
                `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
            >
            <span>Manage Employees</span>
            </NavLink>
        )}

        {/* {hasPermission("view_roles") &&
        <NavLink
            to="/userPage/manageRoles"
            className={({ isActive }) =>
                `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
            >
            <span>Manage Roles</span>
            </NavLink>
        } */}


    </div>
  )
}

export default EmployeeSideBar