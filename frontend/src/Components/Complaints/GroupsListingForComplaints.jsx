import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../Context/authContext';
import { getUserGroupsHook } from '../../utils/GroupsHelper';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';


const GroupsListingForComplaints = () => {
  const { user } = useAuthContext(); 
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchUserGroups = async () => {
      setLoading(true)
      const data = await getUserGroupsHook(user._id);
      setGroups(data)
      setLoading(false)
    };
    useEffect(() => {
      if (user?._id) {
        fetchUserGroups();
      }
    }, [user]);

      if(loading) return(
                <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                    <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
                </div>
        )
  
return (
  <div className="max-w-full mx-auto px-6 py-12">
    <h1 className=" flex text-3xl font-bold text-center text-black mb-10 tracking-wide">
      Your Groups
    </h1>

    {loading ? (
      <p className="text-center text-gray-500 text-lg">Loading groups...</p>
    ) : groups.length === 0 ? (
      <p className="text-center text-gray-600 text-lg">You are not part of any groups.</p>
    ) : (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() =>
              navigate(
                `/${user.role === 'admin' ? 'adminPage' : 'userPage'}/groupsForComplaints/${group._id}`
              )
            }
            className="bg-white rounded-2xl shadow hover:shadow-xl border border-gray-100 transition duration-300 cursor-pointer p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {group.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Total Members: {group.users.length}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.users.slice(0, 3).map((u) => (
                <span
                  key={u._id}
                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
                >
                  {u.name}
                </span>
              ))}
              {group.users.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{group.users.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}

export default GroupsListingForComplaints