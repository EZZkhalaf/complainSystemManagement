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
// import CurrentGroupInfo from './Components/EmployeeComponent/ListUserGroups'
import ListUserGroups from './Components/EmployeeComponent/ListUserGroups'
import UserGroupInfo from './Components/EmployeeComponent/UserGroupInfo'
import AddGroup from './Components/AdminComponents/AddGroup'
import AdminGroupInfo from './Components/AdminComponents/AdminGroupInfo'
import AddEmployeeToGroup from './Components/AdminComponents/AddEmployeeToGroup'
import AdminComplainInfo from './Components/AdminComponents/AdminComplainInfo'
import UserHero from './Components/EmployeeComponent/UserHero'
import ListUserComplaints from './Components/EmployeeComponent/ListUserComplaints'
import UserComplaintInfo from './Components/EmployeeComponent/UserComplaintInfo'
import EditEmployeeProfile from './Components/EmployeeComponent/EditEmployeeProfile'
import ManageEmployees from './Components/AdminComponents/ManageEmployees'
import EmployeeInfo from './Components/AdminComponents/EmployeeInfo'
import EmailVerified from './Components/EmailVerified'
import { useAuthContext } from './Context/authContext'
// import AddRolePage from './Components/RoleManagement/ManageRoles'
import ManageRoles from './Components/RoleManagement/ManageRoles'
import AssignUsersToRole from './Components/RoleManagement/AssignUsersToRole'
import AddPermissionsToRole from './Components/RoleManagement/AddPermissionsToRole'
import { hasPermission } from './utils/AuthHooks'

const App = ()=> {
  const {user} = useAuthContext()
  return (
    
    <AnimatePresence mode='wait'>

      <Routes>
        <Route path="/" element = {<Navigate to = "adminPage"/>} ></Route>
        <Route path='/login' element={<SignIn />}/>
        <Route path='/register' element={<SingUp />}/>
        <Route path='/email-verified' element={<EmailVerified />}/>

        <Route path='/adminPage' element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={[ 'admin , supervisor']}>
              <AdminPage />
            </RoleBasedRoutes>
            </PrivateRoutes>
        }>
          <Route index element = {<AdminHero />}></Route>
          <Route path="/adminPage/complaints" element = {<ListComplaints />}></Route>
          {hasPermission(user,"view_groups") && <Route path="/adminPage/groups" element = {<ListGroups />}></Route>}
          
          <Route path="/adminPage/add-group" element = {<AddGroup />}></Route>        
          <Route path="/adminPage/current-group/:id" element = {<AdminGroupInfo />}></Route>        
          <Route path="/adminPage/add-employee/:id" element = {<AddEmployeeToGroup />}></Route>   

          {hasPermission(user,"view_complaints") && <Route path="/adminPage/complaint/:id" element = {<AdminComplainInfo />}></Route>  }
             


          <Route path="/adminPage/settings" element = {<EditEmployeeProfile />}></Route>   
          {hasPermission(user,"view_employees") && (
            <>
              <Route path="/adminPage/listEmployees" element = {<ManageEmployees />}></Route> 
              <Route path="/adminPage/listEmployees/employee/:id" element = {<EmployeeInfo />}></Route>        
            </>
          )}user,


          <Route path='/adminPage/manageRoles' element={<ManageRoles />}/>
          <Route path='/adminPage/manageRoles/role/adduser/:id' element={<AssignUsersToRole />}/>
          <Route path='/adminPage/manageRoles/role/addPermission/:id' element={<AddPermissionsToRole />}/>

          </Route>
        <Route path='/userPage' element={
            <PrivateRoutes>
              <RoleBasedRoutes requiredRole={["employee"]}>
                <UserPage />
              </RoleBasedRoutes>
            </PrivateRoutes>
        }>
          <Route index element = {<UserHero />}></Route>
               


                  
          {hasPermission(user,"add_complaint") && <Route path="/userPage/add-complaint" element = {<AddComplaint />}></Route>   }
          <Route path="/userPage/list-complaints/:id" element = {<ListUserComplaints />}></Route>        
          <Route path="/userPage/complaint/:id" element = {<UserComplaintInfo />}></Route>        
          {hasPermission(user,"view_complaints") && (
            <>
              <Route path="/userPage/complaints" element = {<ListComplaints />}></Route>
              <Route path="/userPage/otherComplaint/:id" element = {<AdminComplainInfo />}></Route>     
            </>
          )}
          
            


          {hasPermission(user,"view_employees") &&<Route path="/userPage/listEmployees" element = {<ManageEmployees />}></Route>} 
          <Route path="/userPage/listEmployees/employee/:id" element = {<EmployeeInfo />}></Route>       

          <Route path="/userPage/settings" element = {<EditEmployeeProfile />}></Route>  


          <Route path="/userPage/current-groups" element = {<ListUserGroups />}></Route>      
          <Route path="/userPage/current-group/:id" element = {<AdminGroupInfo />}></Route>
          {hasPermission(user,"add_group") && <Route path="/userPage/add-group" element = {<AddGroup />}></Route>}
          {hasPermission(user,"view_groups") && <Route path="/userPage/groups" element = {<ListGroups />}></Route>}  
          {hasPermission(user,"add_employee_to_group") && <Route path="/userPage/add-employee/:id" element = {<AddEmployeeToGroup />}></Route>  }
  

         
      
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
