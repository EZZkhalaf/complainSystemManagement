import React from 'react'
import { useAuthContext } from '../Context/authContext'
import { Navigate } from 'react-router-dom';

const PrivateRoutes = ({children}) => {
  const {user} = useAuthContext();

  
    return user ? children : <Navigate to = '/login' /> 
}

export default PrivateRoutes