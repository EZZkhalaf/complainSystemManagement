import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const AdminSideBar = () => {
    const navLinkStyles =
        'flex items-center gap-3 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-700';

    const activeLinkStyles = 'bg-blue-700';
  return (
    <div className='w-60 bg-blue-800 min-h-screen flex flex-col p-4'>

        <NavLink 
            to={"/adminPage/"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                Summary
            </span>
        </NavLink>


        <NavLink 
            to={"/adminPage/complaints"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                List Complaints
            </span>
        </NavLink>

        <NavLink 
            to={"/adminPage/groups"}
            className={({ isActive }) =>
            `${navLinkStyles} ${isActive ? activeLinkStyles : ''}`
            }
        >
            <span>
                List Groups
            </span>
        </NavLink>




    </div>
  )
}

export default AdminSideBar