
// import React, { useEffect, useState } from 'react';
// import { useAuthContext } from '../Context/authContext';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { CiSettings } from 'react-icons/ci';
// import defaultPhoto from '../assets/defaultPhoto.png';
// import logo  from '../assets/logo.jpg'
// const NavigationBar = ({onMobileSideBarToggle}) => {
//   const { user, logout } = useAuthContext();
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const profilePicture = user.profilePicture
//     ? `http://localhost:5000${user.profilePicture}`
//     : defaultPhoto;

//   return (
//     <nav className="bg-slate-900 text-slate-300 px-6 py-3 shadow-md sticky top-0 z-30">
//       <div className="max-w-full mx-auto flex items-center justify-between">
//         {/* Left side: Profile */}
//         <div>
//           <img src={logo} alt="Logo" className="w-12 h-12" />
//         </div>
//           <div className="flex  flex-end items-center justify-end gap-4">
//             <img
//               src={profilePicture}
//               alt="Profile"
//               className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-sm"
//             />
//             <div className=" sm:block">
//               <p className="font-semibold text-white">{user?.name}</p>
//               <p className="text-sm text-blue-400 capitalize">{user?.role}</p>
//             </div>
//           </div>
//         </div>
//     </nav>
//   );
// };

// export default NavigationBar;


import React from 'react';
import { useAuthContext } from '../Context/authContext';
import { NavLink } from 'react-router-dom';
import defaultPhoto from '../assets/defaultPhoto.png';
import logo from '../assets/logo.jpg';
import { IoMdMenu } from 'react-icons/io';

const NavigationBar = ({ onMobileSideBarToggle }) => {
  const { user } = useAuthContext();

  const profilePicture = user?.profilePicture
    ? `http://localhost:5000${user.profilePicture}`
    : defaultPhoto;

  return (
    <nav className="bg-slate-900 text-slate-300 px-4 py-3 shadow-md sticky top-0 z-30">
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* Left: Mobile Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden text-slate-300 hover:text-white focus:outline-none p-2 rounded-md transition-colors"
            onClick={onMobileSideBarToggle}
          >
            <IoMdMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-md" />
        </div>

        {/* Right: Profile info */}
        <div className="flex items-center gap-4">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shadow-sm"
          />
          <div className="hidden sm:flex flex-col">
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-blue-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
