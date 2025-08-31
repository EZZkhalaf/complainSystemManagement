import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Context/authContext";
import { listGroupsHook } from "../../utils/GroupsHelper";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import { hasPermission } from "../../utils/AuthHooks";
import PageHeader from "../../Molecules/PageHeader";
import GroupsTable from "../../MainComponents/ListGroups/GroupsTable";
import PageLoading from "../../Atoms/PageLoading";
import CustomizeButton from "../../Atoms/CustomizeButton";

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

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        header={"Manage Groups"}
        paragraph={`
            View, explore, and manage all groups created in the system. You can
          inspect group members and create new groups to organize your team
          efficiently.
          `}
      />

      {hasPermission(user, "add_group") && (
        <CustomizeButton
          text={"Create Group"}
          onClick={() => {
            navigate(
              `/${user.role === "admin" ? "adminPage" : "userPage"}/add-group`
            );
          }}
        />
      )}

      <GroupsTable groups={groups} />
    </div>
  );
};

export default ListGroups;
