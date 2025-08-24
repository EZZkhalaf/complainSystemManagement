import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../Context/authContext';
import { getUserGroupsHook } from '../../utils/GroupsHelper';
import { useNavigate } from 'react-router-dom';

const ListUserGroups = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchUserGroups = async () => {
    const data = await getUserGroupsHook(user._id);
    console.log(data)
    setGroups(data)
    
  };
  useEffect(() => {
    if (user?._id) {
      fetchUserGroups();
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">Your Groups</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-gray-600">You are not part of any groups.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <div 
              key={group._id} 
              onClick={() =>navigate(`/userPage/current-group/${group.group_id}`) }
              className="bg-white shadow-md border rounded-2xl p-5 hover:shadow-lg transition">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{group.group_name}</h2>
                <p className="text-sm text-gray-500 mb-3">Total Members: {group.users.length}</p>

                <div className="flex flex-wrap gap-2">
                  {group.users.slice(0, 3).map((u) => (
                    <span key={u._id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {u.user_name}
                    </span>
                  ))}
                  {group?.users.length > 3 && (
                    <span className="text-xs text-gray-500">+{group.users.length - 3} more</span>
                  )}
                </div>
            </div>
           ))} 
        </div>
      )}
    </div>
  );
}

export default ListUserGroups