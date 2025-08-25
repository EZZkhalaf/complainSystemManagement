import React, { useEffect, useState } from "react";
import NavigationBar from "../Components/NavigationBar";
import { Outlet, useNavigate } from "react-router-dom";
import EmployeeSideBar from "../Components/EmployeeComponent/EmployeeSideBar";
import { useAuthContext } from "../Context/authContext";

const UserPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user.role === "admin") {
      navigate("/adminPage");
    }
  }, []);
  return (
    <div className="flex min-h-screen">
      <EmployeeSideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-60">
        <NavigationBar
          onMobileSideBarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserPage;
