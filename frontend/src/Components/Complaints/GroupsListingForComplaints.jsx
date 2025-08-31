import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Context/authContext";
import { getUserGroupsHook } from "../../utils/GroupsHelper";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import PageHeader from "../../Molecules/PageHeader";
import PageLoading from "../../Atoms/PageLoading";
import FailedMessage from "../../Atoms/FailedMessage";
import TableHeaders from "../../Molecules/TableHeaders";

const GroupsListingForComplaints = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchUserGroups = async () => {
    setLoading(true);
    const data = await getUserGroupsHook(user._id);
    // console.log(data)
    setGroups(data);
    setLoading(false);
  };
  useEffect(() => {
    if (user?._id) {
      fetchUserGroups();
    }
  }, [user]);

  if (loading)
    return (
      <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="max-w-full mx-auto px-6 py-12">
      <PageHeader
        header={"Your Groups "}
        paragraph={`view the assigned complaints to you groups so you can accept them or reject them `}
      />

      {loading ? (
        <PageLoading />
      ) : groups.length === 0 ? (
        <FailedMessage
          message={"sorry you are not in any group at the moment"}
        />
      ) : (
        <div className="overflow-x-auto shadow rounded-2xl border border-gray-200">
          <table className="min-w-full text-left text-gray-700">
            <TableHeaders headers={["Group Name", "Members", "Users"]} />
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.group_id}
                  onClick={() =>
                    navigate(
                      `/${
                        user.role === "admin" ? "adminPage" : "userPage"
                      }/groupsForComplaints/${group.group_id}`
                    )
                  }
                  className="cursor-pointer hover:bg-gray-50 transition"
                >
                  {/* Group Name */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {group.group_name}
                  </td>

                  {/* Members count */}
                  <td className="px-6 py-4">{group.users.length}</td>

                  {/* Users preview */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {group.users.slice(0, 3).map((u) => (
                        <span
                          key={u._id}
                          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                        >
                          {u.user_name}
                        </span>
                      ))}
                      {group.users.length > 3 && (
                        <span className="text-xs text-gray-500">
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

export default GroupsListingForComplaints;
