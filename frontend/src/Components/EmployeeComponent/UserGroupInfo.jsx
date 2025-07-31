import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { getGroupInfoHook } from '../../utils/GroupsHelper';

const UserGroupInfo = () => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
  
  
  
    const [currentPage , setCurrentPage] = useState(1);
    const usersPerPage = 6;
    const totalUsers = group?.group?.users || [];
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = totalUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(totalUsers.length / usersPerPage);
  
    const navigate = useNavigate();
    const { id } = useParams();
  
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const data = await getGroupInfoHook(id);
        if (data) {
          setGroup(data);
        } else {
          setError("Group not found or error occurred.");
        }
      } catch (err) {
        setError("Something went wrong while fetching the group.");
      } finally {
        setLoading(false);
      }
    };

  
  
    useEffect(() => {
      fetchGroup();
    }, [id ]);


  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!group) return null; 

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Group Info Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-1 flex items-center justify-center">
            {group.group.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Created at: {new Date(group.group?.createdAt).toLocaleDateString()}
          </p>
        </div>
        {/* <button
          onClick={() => navigate(`/adminPage/add-employee/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
        >
          + Add Employee
        </button> */}
      </div>

      {/* Group Users Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-700">Group Users</h2>
      </div>

          {/* Group Users Grid */}
        {group.group.users?.length === 0 ? (
          <div className="text-gray-500 italic">No users yet in this group.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {group.group.users?.map(user => (
              <div
                key={user._id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                {/* <button 
                  onClick={(e) => {
                    removeUserFromGroup(e , user._id)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors">
                  Remove
                </button> */}
              </div>
            ))}
          </div>
        )}

    </div>

  );
}

export default UserGroupInfo