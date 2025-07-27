import React from 'react'
import { useAuthContext } from '../Context/authContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
    const {user , logout} = useAuthContext();
    const [menuOpen , setMenuOpen] = useState(false)
    const navigate = useNavigate();
    const handleLogout = () =>{
        logout();
        navigate("/login")
    }
   return (
        <nav className="bg-blue-800 text-white px-6 py-4 shadow-md relative">
        
            <div className="flex items-center justify-between">
                {/* Logo / Role */}
                <div className="text-xl sm:text-2xl font-semibold tracking-wide">
                <span className="text-white">Role: </span>
                <span className="text-yellow-400 capitalize">{user.role}</span>
                </div>

                <div className=" md:flex items-center gap-6">
                
                    <span className="text-lg font-medium">
                        Name :  <span className="font-semibol">{user.name}</span>
                    </span>
                
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>

                {/* mobile side x` */}
                <div className="md:hidden">
                <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
                    <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    {menuOpen ? (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                    </svg>
                </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${
                menuOpen ? 'max-h-40 opacity-100 pt-4' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                <div className="flex flex-col gap-4 bg-blue-700 px-6 py-4 rounded-md mt-2 shadow-md z-20">
                {user && (
                    <span className="text-white text-lg font-medium">
                    Hello, <span className="font-semibold">{user.name}</span>
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
                </div>
            </div>
            </nav>

  );
}

export default NavigationBar