import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../Context/authContext';
import { listGroupsHook } from '../../utils/GroupsHelper';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';
import { hasPermission } from '../../utils/AuthHooks';

const ListGroups = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUserGroups = async () => {
    setLoading(true);
    const data = await listGroupsHook(user._id);
    setGroups(data);
    setLoading(false);
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
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Groups</h1>
        <p className="text-gray-600 max-w-xl">
          View, explore, and manage all groups created in the system. You can inspect group members and create new groups to organize your team efficiently.
        </p>
      </div>

      {/* Create Group Button */}
      {hasPermission(user, 'add_group') && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() =>
              navigate(`/${user.role === 'admin' ? 'adminPage' : 'userPage'}/add-group`)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Create Group
          </button>
        </div>
      )}

      {/* Groups Table */}
      {groups.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No groups found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Group Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Members</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr
                  key={group._id}
                  onClick={() =>
                    navigate(
                      `/${user.role === 'admin' ? 'adminPage' : 'userPage'}/current-group/${group.group_id}`
                    )
                  }
                  className="hover:bg-gray-50 cursor-pointer transition duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{group.group_name}</td>
                  <td className="px-6 py-4 text-gray-600">{group.users.length}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {group.users.slice(0, 3).map((user) => (
                        <span
                          key={user._id}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
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
};

export default ListGroups;
