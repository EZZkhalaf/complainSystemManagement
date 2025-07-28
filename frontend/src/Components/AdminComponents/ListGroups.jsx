import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../Context/authContext';
import { listGroupsHook } from '../../utils/GroupsHelper';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';

const ListGroups = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchUserGroups = async () => {
    setLoading(true)
    const data = await listGroupsHook(user._id);
    setGroups(data);
    setLoading(false)

  };

  useEffect(() => {
    if (user?._id) {
      fetchUserGroups();
    }
  }, [user]);
  if(loading) return(
            <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )
  return (
     <div className="max-w-5xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">All The Groups</h1>

      <div className="mb-6 flex justify-end">
        <button 
        onClick={()=> navigate('/adminPage/add-group')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-gray-500">You are not part of any groups yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-500 tracking-wide">
                <th className="p-4 font-medium">Group Name</th>
                <th className="p-4 font-medium">Members</th>
                <th className="p-4 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map(group => (
                <tr
                  key={group._id}
                  onClick={() => navigate(`/adminPage/current-group/${group._id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="p-4 text-gray-800 font-medium">{group.name}</td>
                  <td className="p-4 text-gray-600">{group.users.length}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {group.users.slice(0, 3).map(user => (
                        <span
                          key={user._id}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {user.name}
                        </span>
                      ))}
                      {group.users.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{group.users.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
</div>

  );
}

export default ListGroups