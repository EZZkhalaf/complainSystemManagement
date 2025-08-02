import React, { useEffect, useState } from 'react';
import RoleComponent from './RoleComponent';
import { useNavigate } from 'react-router-dom';
import { addnewRoleHook, fetchRolesHook } from '../../utils/RolesHelper';
import AssignUsersToRole from './AssignUsersToRole';

const ManageRoles = () => {
  const [adding, setAdding] = useState(false);
  const [newRole, setNewRoleName] = useState('');
  const [roles , setRoles] = useState([])
  const [addingEmployee , setAddEmployee] = useState(false)
  const [selectedRoleToAddEmployee , setSelectedRoleToAddEmployee] = useState({})
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    const data = await addnewRoleHook(newRole);
    setRoles([...roles , data])
    setNewRoleName('');
    setAdding(false);
  };


    const fetchRoles = async() =>{
          const data = await fetchRolesHook();
          setRoles(data)
    }
    useEffect(()=>{
      fetchRoles()
    },[])

  return (
    <div className="p-6 space-y-6">
      {/* Top Header and Add Role Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Manage Roles:</h1>

        {/* Inline Input Section */}
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="bg-blue-500 px-4 py-2 rounded-bl-xl rounded-tl-2xl hover:bg-blue-600 transition"
          >
            <p className="text-white font-bold">Add New Role</p>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              required
              autoFocus
              className="px-3 py-2 border rounded-md w-48"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewRoleName('');
              }}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
      

      {/* Role Cards */}
      <RoleComponent roles = {roles} setAddEmployee = {setAddEmployee} setRoles = {setRoles} setSelectedRoleToAddEmployee = {setSelectedRoleToAddEmployee}/>
    </div>
  );
};

export default ManageRoles;
