import React, { useEffect, useState } from 'react';
import defaultPhoto from '../../assets/defaultPhoto.png';
import { useParams } from 'react-router-dom';
import { useScroll } from 'framer-motion';
import { getUserByIdHook } from '../../utils/UserHelper';

const EmployeeInfo = () => {
    const {id} = useParams();
    const [employee , setEmployee] = useState(null)
    const [groups , setGroups] = useState([])

    const getUserData = async()=>{
        const data = await getUserByIdHook(id);
        console.log(data)
        setEmployee(data.user);
        setGroups(data.groups)
    }
    useEffect(()=>{
        getUserData()
    },[])
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white rounded-3xl shadow-xl mt-8 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={employee?.user.profilePicture ? `http://localhost:5000${employee.user.profilePicture}` : defaultPhoto}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-blue-800 capitalize">{employee?.user.name || 'Employee Name'}</h2>
          <p className="text-gray-600 mt-1">{employee?.email || 'email@example.com'}</p>
          <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full capitalize">
            {employee?.role || 'user'}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Joined:</p>
          <p className="text-gray-700 font-medium">{employee?.createdAt?.slice(0, 10) || 'N/A'}</p>
        </div>
        {groups && groups.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {groups.map((g) => (
                <div
                    key={g._id}
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

      </div>
    </div>
  );
};

export default EmployeeInfo;
