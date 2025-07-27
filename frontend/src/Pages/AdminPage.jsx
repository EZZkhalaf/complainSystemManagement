import React from 'react'
import { useAuthContext } from '../Context/authContext'
import NavigationBar from '../Components/NavigationBar';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSideBar from '../Components/AdminComponents/AdminSideBar';

const AdminPage = () => {
    const { user , logout } = useAuthContext();
  const navigate = useNavigate()

  useEffect(()=>{

    if (!user) {
      toast.error("please login again")
      navigate('/login')
    };
    if(user.role !== 'admin') navigate('/userPage')
  },[user , navigate])
  return (
       <div className="flex flex-col min-h-screen">
            <NavigationBar />
            <div className="flex flex-grow">
                <AdminSideBar />
                <div className="flex-grow p-6">
               
                    <Outlet />
                </div>
                
            </div>
        </div>
  )
}

export default AdminPage