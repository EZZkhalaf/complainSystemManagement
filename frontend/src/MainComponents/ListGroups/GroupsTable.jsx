import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";

const GroupsTable = ({ groups }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  return (
    <div>
      {groups.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No groups found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Group Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Members
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr
                  key={group._id}
                  onClick={() =>
                    navigate(
                      `/${
                        user.role === "admin" ? "adminPage" : "userPage"
                      }/current-group/${group.group_id}`
                    )
                  }
                  className="hover:bg-gray-50 cursor-pointer transition duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {group.group_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {group.users.length}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {group.users.slice(0, 3).map((user) => (
                        <span
                          key={user._id}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                        >
                          {user.user_name}
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

export default GroupsTable;
