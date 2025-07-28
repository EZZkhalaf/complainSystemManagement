import React from 'react'
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';

const EmployeeSideBar = () => {
    const {user} = useAuthContext();
  const navLinkStyles =
        'flex items-center gap-3 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-700';

    const activeLinkStyles = 'bg-blue-700';
  return (
    <div className='w-60 bg-blue-700 min-h-screen flex flex-col p-4'>
        
        
        <NavLink 
            to={"/userPage/"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                Home
            </span>
        </NavLink>
        
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

        <NavLink 
            to={"/userPage/current-groups"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                List Groups
            </span>
        </NavLink>

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


    </div>
  )
}

export default EmployeeSideBar