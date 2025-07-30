import React, { useEffect, useState } from 'react';
import defaultPhoto from '../../assets/defaultPhoto.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useScroll } from 'framer-motion';
import { changeUserRoleHook, getUserByIdHook } from '../../utils/UserHelper';
import { toast } from 'react-toastify';



const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/adminPage/complaint/${complaint._id}`)}
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
    
    const [employee , setEmployee] = useState(null)
    const [groups , setGroups] = useState([])
    const [complaints , setComplaints] = useState([])
    const navigate = useNavigate();




    const [editing, setEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState(employee?.role || 'User');

    const handleRoleChange = async(e) => {
      e.preventDefault();
      let userId = id ;
      let newRole = selectedRole;
      if(employee.role !== selectedRole){
        const data = await changeUserRoleHook(userId , newRole);
        console.log(data)


        if(data.success){
          
          setSelectedRole(newRole)
          toast.success(data.message)
        }else if(!data.success){
            
            
            toast.info(data.message)
          }
      }
    };

    console.log(employee)


    const getUserData = async()=>{
        const data = await getUserByIdHook(id);
        setEmployee(data.user);
        setGroups(data.groups)
        setComplaints(data.complaints)
        setSelectedRole(data.user.role)
        
    }
    useEffect(()=>{
        getUserData()
    },[])

    useEffect(() => {
  if (employee?.role) {
    setSelectedRole(selectedRole); // sync role after data is fetched
  }
}, [employee]);

  return (
    <div className="max-w-full mx-auto p-6 sm:p-10 bg-white rounded-3xl shadow-xl  border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={employee?.user.profilePicture ? `http://localhost:5000${employee.user.profilePicture}` : defaultPhoto}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-blue-800 capitalize">{employee?.user.name || 'Employee Name'}</h2>
          <p className="text-gray-600 mt-1">{employee?.user.email || 'email@example.com'}</p>
        </div>
      </div>

      <div className="mt-2 space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">

          <div className='flex justify-around items-center'>

            <div className="flex items-center gap-3">
                <span className="px-3 capitalize text-xl flex items-center gap-2">
                  <span className="text-gray-500">Role:</span>
                  {!editing ? (
                    <span>{selectedRole}</span>
                  ) : (
                    <select
                      value={selectedRole}
                      onChange={(e)=> setSelectedRole(e.target.value)}
                      className="border rounded px-2 py-1 text-md scroll-auto"
                    >
                      <option value="admin" >admin</option>
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                    </select>
                  )}
                </span>

                  {!editing && (
                      <button
                        onClick={() => setEditing((prev) => !prev)}
                        className="text-white bg-gray-400 p-1 rounded-full  text-md  "
                      >
                        Edit Role
                      </button>
                  )}
                {editing && (
                  <div>
                
                    <button
                      onClick={() => setEditing((prev) => !prev)}
                      className="text-white bg-red-500 p-1 rounded-full  text-sm mr-2"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={(e) => {
                        setEditing((prev) => !prev)
                        handleRoleChange(e);
                      }}
                    className="text-white bg-gray-400 p-1 rounded-full  text-sm"
                    >
                      Confirm
                    </button>
                </div>
                )}

              </div>
            <div className='flex items-center'>
              <p className="text-m text-gray-500">Joined :</p>
              <p className="text-gray-700 font-medium ml-2">{employee?.createdAt?.slice(0, 10) || 'N/A'}</p>
            </div>
          </div>
        </div>
        <h1 className='flex text-xl text-gray-500 '>Groups : </h1>
        {groups && groups.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {groups.map((g) => (
                <div
                    key={g._id}
                    onClick={()=> navigate(`/adminPage/current-group/${g._id}`)}
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
