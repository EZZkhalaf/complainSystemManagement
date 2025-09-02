import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Context/authContext";
import { getUserGroupsHook } from "../../utils/GroupsHelper";
import { useNavigate } from "react-router-dom";
import GroupsTable from "../../MainComponents/ListGroups/GroupsTable";

const ListUserGroups = () => {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchUserGroups = async () => {
    const data = await getUserGroupsHook(user._id);
    setGroups(data);
  };
  useEffect(() => {
    if (user?._id) {
      fetchUserGroups();
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">
        Your Groups
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-gray-600">
          You are not part of any groups.
        </p>
      ) : (
        <GroupsTable groups={groups} />
      )}
    </div>
  );
};

export default ListUserGroups;
