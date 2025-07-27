import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './Pages/SignIn'
import SingUp from './Pages/SingUp'
import AdminPage from './Pages/AdminPage'
import UserPage from './Pages/UserPage'
import { ToastContainer } from 'react-toastify'
import './App.css'
import { AnimatePresence } from 'framer-motion'
import PrivateRoutes from './utils/Privateroutes'
import RoleBasedRoutes from './utils/RoleBasedRoutes'
import AdminHero from './Components/AdminComponents/AdminHero'
import ListComplaints from './Components/AdminComponents/ListComplaints'
import ListGroups from './Components/AdminComponents/ListGroups'
import AddComplaint from './Components/EmployeeComponent/AddComplaint'
import CurrentGroupInfo from './Components/EmployeeComponent/ListUserGroups'
import ListUserGroups from './Components/EmployeeComponent/ListUserGroups'
import UserGroupInfo from './Components/EmployeeComponent/UserGroupInfo'
import AddGroup from './Components/AdminComponents/AddGroup'
import AdminGroupInfo from './Components/AdminComponents/AdminGroupInfo'

const App = ()=> {

  return (
    
    <AnimatePresence mode='wait'>

      <Routes>
        <Route path="/" element = {<Navigate to = "adminPage"/>} ></Route>
        <Route path='/login' element={<SignIn />}/>
        <Route path='/register' element={<SingUp />}/>
        <Route path='/adminPage' element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={[ 'admin']}>
              <AdminPage />
            </RoleBasedRoutes>
            </PrivateRoutes>
        }>
          <Route index element = {<AdminHero />}></Route>
          <Route path="/adminPage/complaints" element = {<ListComplaints />}></Route>
          <Route path="/adminPage/groups" element = {<ListGroups />}></Route>
          <Route path="/adminPage/add-group" element = {<AddGroup />}></Route>        
          <Route path="/adminPage/current-group/:id" element = {<AdminGroupInfo />}></Route>        

          </Route>
        <Route path='/userPage' element={
            <PrivateRoutes>
              <RoleBasedRoutes requiredRole={["employee"]}>
                <UserPage />
              </RoleBasedRoutes>
            </PrivateRoutes>
        }>
          <Route path="/userPage/add-complaint" element = {<AddComplaint />}></Route>        
          <Route path="/userPage/current-groups" element = {<ListUserGroups />}></Route>        
          <Route path="/userPage/current-group/:id" element = {<UserGroupInfo />}></Route>        
        </Route>
      </Routes>
      <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />
    </AnimatePresence>
   
  )
}

export default App
