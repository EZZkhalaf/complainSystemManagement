import React, { useState } from 'react'
import { useAuthContext } from '../Context/authContext'
import NavigationBar from '../Components/NavigationBar';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSideBar from '../Components/AdminComponents/AdminSideBar';

const AdminPage = () => {
  const { user , logout } = useAuthContext();
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(()=>{

    if (!user) {
      toast.error("please login again")
      navigate('/login')
    };
    if(user.role !== 'admin') navigate('/userPage')
  },[user , navigate])
  return (
       <div className="flex min-h-screen">
          {/* Sidebar */}
          <AdminSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:ml-60"> {/* <-- add lg:ml-64 */}
            <NavigationBar onMobileSideBarToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex-1 overflow-auto p-6">
              <Outlet />
            </div>
          </div>
        </div>


  )
}

export default AdminPage