import React from 'react'
import { useAuthContext } from '../Context/authContext'
import { Navigate } from 'react-router-dom';

const RoleBasedRoutes = ({children , requiredRole}) => {
    const {user} = useAuthContext();

    if(!requiredRole.includes(user.role)) <Navigate to = '/unauthorized'/>
    return user ? children : <Navigate to = '/login' />
}

export default RoleBasedRoutes