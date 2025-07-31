import React, { useEffect, useState } from 'react';
import defaultPhoto from '../../assets/defaultPhoto.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useScroll } from 'framer-motion';
import { adminUpdateUserInfoHook, changeUserRoleHook, getUserByIdHook } from '../../utils/UserHelper';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../Context/authContext';
import { fetchRolesHook } from '../../utils/RolesHelper';



const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/${user.role === 'admin' ?"adminPage" : 'userPage'}/complaint/${complaint._id}`)}
      className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition duration-200 flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
          {complaint.type} Complaint
        </h3>
        <p className="text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyles(complaint.status)}`}>
          {complaint.status}
        </span>
        <div className="text-sm text-gray-500 text-right">
          <p className="font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};


const getStatusStyles = (status) => {
  const styles = {
    resolved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

const EmployeeInfo = () => {
    const {id} = useParams();
    
    const{user} = useAuthContext();
    const [employee , setEmployee] = useState(null)
    const [groups , setGroups] = useState([])
    const [complaints , setComplaints] = useState([])
    const [roles , setRoles] = useState([]);



    const navigate = useNavigate();




    const [editing, setEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState(employee?.role || 'User');
    const [editableName, setEditableName] = useState('');
    const [editableEmail, setEditableEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [editablePermissions, setEditablePermissions] = useState(employee?.permissions || []);


    console.log(employee)

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        //  const mappedPermissions = {};
        // allPermissions.forEach((perm) => {
        //   mappedPermissions[perm] = editablePermissions.includes(perm);
        // });


        const userId = id;
        const newRole = selectedRole;

        if (employee.role !== selectedRole) {
          const data = await changeUserRoleHook(userId, newRole);
          if (data.success) {
            setSelectedRole(newRole);
            toast.success(data.message);
          } else {
            toast.info(data.message);
          }
        }

        if (
          editableEmail !== employee.email ||
          editableName !== employee.name ||
          newPassword.trim() !== "" || 
          JSON.stringify(mappedPermissions) !== JSON.stringify(employee?.permissions)
        ) {
          const newName = editableName;
          const newEmail = editableEmail;
          const adminId = user._id;

          const data = await adminUpdateUserInfoHook(
            adminId,
            userId,
            newName,
            newEmail,
            newPassword,
            mappedPermissions
          );

          if (data.success) {
            toast.success(data.message);
            setEmployee((prev) => ({
              ...prev,
              user: {
                ...prev.user,
                name: newName,
                email: newEmail
              }
            }));
          } else {
            toast.error(data.message);
          }
        }

        setEditing(false);
    };







    const getUserData = async()=>{
        const data = await getUserByIdHook(id);
        
        const roles = await fetchRolesHook();
        setRoles(roles.map(({user , ...rest}) => rest))


        if (!data || !data.user || data.user.length === 0) return;

        const user = data.user[0]; 

        setEmployee(user);
        setGroups(data.groups);
        setComplaints(data.complaints);
        setSelectedRole(data.role); // You already have role in response

        setEditableName(user.name);
        setEditableEmail(user.email);
              
    }
    useEffect(()=>{
        getUserData()
    },[])

    useEffect(() => {
      if (employee?.role) {
        setSelectedRole(selectedRole); // sync role after data is fetched
      }
      if (employee?.permissions) {
        const enabledPermissions = Object.keys(employee.permissions).filter(
          (key) => employee.permissions[key] === true
        );
        setEditablePermissions(enabledPermissions);
      }
    }, [employee]);


  return (
    <div className="max-w-full mx-auto p-6 sm:p-10 bg-white rounded-3xl shadow-xl  border border-gray-200">
      <div className="flex justify-end mb-4">

        {user.role === 'admin' && (
          <div>
              {/* {user.permissions.editUsers && ( */}
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition mr-4"
                >
                  {editing ? 'Cancel Edit' : 'Edit'}
                </button>
              {/* )} */}
          </div>
        )}

        {editing && (
          <button
            onClick={handleSaveChanges}
            className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition "
          >
            Save Changes
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={employee?.profilePicture ? `http://localhost:5000${employee.profilePicture}` : defaultPhoto}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="text-center sm:text-left">
          {!editing ? (
              <>
                <h2 className="text-2xl font-bold text-blue-800 capitalize">{employee?.name}</h2>
                <p className="text-gray-600 mt-1">{employee?.email}</p>
              </>
            ) : (
              <div className='flex flex-col'>
                <input
                  type="text"
                  name = "editableName"
                  id = 'editableName'
                  className="border rounded-lg px-3 py-1 text-xl font-semibold text-blue-800 capitalize"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                />
                <input
                  type="email"
                  name = "editableEmail"
                  id = 'editableEmail'
                  className="border rounded-lg px-3 py-1 mt-2 text-gray-700"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                />

                <input
                  type="password"
                  id = 'newPassword'
                  placeholder='Change User Password'
                  className="border rounded-lg px-3 py-1 mt-2 text-gray-700"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            )}

        </div>
      </div>

      <div className="mt-2 space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">

          <div className='flex justify-around items-center'>

            <div className="flex items-center gap-3">
                <span className="px-3 capitalize text-xl flex flex-col gap-2 text-md">
                    <div className='flex items-center gap-2'>
                      <span className="text-gray-500">Role:</span>

                    {editing ? (
                      <select
                        value={selectedRole}
                        onChange={(e)=> setSelectedRole(e.target.value)}
                        className="border rounded px-2 py-1 text-md"
                      >
                        {roles.map((role) => (
                          <option key={role._id} value={role.role}>{role.role}</option>
                        ))}
                      </select>
                    ):(
                      <p>{selectedRole}</p>
                    )}



                    </div>         
                  </span>
              </div>
             
            <div className='flex items-center'>
              <p className="text-m text-gray-500">Joined :</p>
              <p className="text-gray-700 font-medium ml-2">{employee?.createdAt?.slice(0, 10) || 'N/A'}</p>
            </div>
          </div>
        </div>
        <h1 className='flex text-xl text-gray-500 '>Groups : </h1>

        {/* groups listing */}
        {groups && groups.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {groups.map((g) => (
                <div
                    key={g._id}
                    onClick={()=> navigate(`/${user.role === 'admin' ? 'adminPage' : 'userPage'}/current-group/${g._id}`)}
                    className="p-4 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
                >
                    <h3 className="text-lg font-semibold text-blue-800 mb-2 capitalize">
                    {g.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                    Members: {g.users?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                    Created at: {g.createdAt ? g.createdAt.slice(0, 10) : 'N/A'}
                    </p>
                </div>
                ))}
            </div>
            ) : (
            <div className="text-center mt-6">
                <p className="text-gray-600 italic">This user is not in any group at the moment.</p>
            </div>
        )}



        {/* complaint listing */}
        <h1 className=' flex text-xl text-gray-500'>Complaints : </h1>
        {complaints.length > 0 ? (
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3'>
            {[...complaints]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort newest first
            .map((complaint)=>(
              <ComplaintCard key={complaint._id} complaint={complaint}/>
            ))}
          </div>
        ):(
          <div className="text-center mt-6">
                <p className="text-gray-600 italic">This user does not have any complaints at the moment </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;