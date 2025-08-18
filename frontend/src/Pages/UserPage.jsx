import React, { useEffect, useState } from 'react'
import NavigationBar from '../Components/NavigationBar'
import { Outlet, useNavigate } from 'react-router-dom'
import EmployeeSideBar from '../Components/EmployeeComponent/EmployeeSideBar'
import { useAuthContext } from '../Context/authContext'

const UserPage = () => {
  const {user} = useAuthContext() ;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(()=>{
    if(user.role === 'admin'){
      navigate('/adminPage')
    }
  },[])
  return (
       <div className="flex flex-col min-h-screen">
            <NavigationBar onMobileSideBarToggle = { () => setSidebarOpen(!sidebarOpen)}/>
            <div className="flex flex-grow">
                <EmployeeSideBar 
                  isOpen = {sidebarOpen}
                  onClose = {() => setSidebarOpen(false)}
                />
                <div className="flex-grow p-6">
               
                    <Outlet />
                </div>
                
            </div>
        </div>
  )
}

export default UserPage