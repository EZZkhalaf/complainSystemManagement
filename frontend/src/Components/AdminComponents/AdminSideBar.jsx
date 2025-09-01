import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { hasPermission } from "../../utils/AuthHooks";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import AdminNavLinks from "../../MainComponents/SideBar/AdminNavLinks";

const AdminSideBar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  return (
    <>
      {/* Overlay (background) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-none bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-slate-900 flex flex-col justify-between
          p-3 shadow-lg overflow-y-auto
          w-64 sm:w-56 md:w-60
          h-screen fixed top-0 left-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          z-50
        `}
      >
        <AdminNavLinks handleLogout={handleLogout} />
      </aside>
    </>
  );
};

export default AdminSideBar;
