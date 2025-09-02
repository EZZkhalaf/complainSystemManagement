import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { hasPermission } from "../../utils/AuthHooks";
import { CiSettings } from "react-icons/ci";
import EmployeeNavLinks from "../../MainComponents/SideBar/EmployeeNavLinks";

const EmployeeSideBar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
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
        <EmployeeNavLinks handleLogout={handleLogout} />
      </aside>
    </>
  );
};

export default EmployeeSideBar;
