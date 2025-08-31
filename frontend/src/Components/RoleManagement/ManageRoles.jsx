import React, { useEffect, useState } from "react";
import RoleComponent from "../../MainComponents/ManageRoles/RoleComponent";
import AssignUsersToRole from "./AssignUsersToRole";
import { useNavigate } from "react-router-dom";
import { addnewRoleHook, fetchRolesHook } from "../../utils/RolesHelper";
import PageHeader from "../../Molecules/PageHeader";
import InputForm from "../../MainComponents/AdminHero/InputForm";
import PageLoading from "../../Atoms/PageLoading";
import CustomizeButton from "../../Atoms/CustomizeButton";
import FailedMessage from "../../Atoms/FailedMessage";
import OptionsList from "../../MainComponents/ManageRoles/OptionsList";

const ManageRoles = () => {
  const [adding, setAdding] = useState(false);
  const [newRole, setNewRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingEmployee, setAddEmployee] = useState(false);
  const [selectedRoleToAddEmployee, setSelectedRoleToAddEmployee] = useState(
    {}
  );

  const fields = [
    {
      name: "newRole",
      label: "Email",
      type: "newRole",
      value: newRole,
      setValue: setNewRoleName,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    const data = await addnewRoleHook(newRole);
    setRoles([...roles, data]);
    setNewRoleName("");
    setAdding(false);
  };

  const fetchRoles = async () => {
    setLoading(true);
    const data = await fetchRolesHook();

    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <PageHeader
          header={"Manage Roles"}
          paragraph={`
            Create, edit, and assign roles to employees to manage permissions efficiently.
          `}
        />

        <div className="flex justify-between items-center">
          {!adding ? (
            <CustomizeButton
              text={<p className="text-white font-bold">Add New Role</p>}
              onClick={() => setAdding(true)}
            />
          ) : (
            <InputForm
              fields={fields}
              handleSubmit={handleSubmit}
              buttonText={"submit"}
              cancelButton={true}
              onClickCancel={() => {
                setAdding(false);
                setNewRoleName("");
              }}
              css={`flex items-center space-x-2`}
              submitButtonCss={
                "bg-blue-600 text-white px-3 py-2 rounded hover:bg-green-700"
              }
            />
          )}
        </div>
      </div>

      {loading && <PageLoading />}

      {!loading && roles.length === 0 && (
        <FailedMessage
          message={"No roles found yet. Start by adding a new role above."}
        />
      )}

      {!loading && roles.length > 0 && (
        <RoleComponent
          roles={roles}
          setAddEmployee={setAddEmployee}
          setRoles={setRoles}
          setSelectedRoleToAddEmployee={setSelectedRoleToAddEmployee}
        />
      )}

      {addingEmployee && (
        <OptionsList
          setAddEmployee={setAddEmployee}
          setSelectedRoleToAddEmployee={setSelectedRoleToAddEmployee}
        />
      )}
    </div>
  );
};

export default ManageRoles;
