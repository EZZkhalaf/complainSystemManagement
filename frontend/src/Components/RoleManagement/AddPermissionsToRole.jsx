import React, { useEffect, useState } from "react";
import {
  addPErmissionsToRoleHook,
  createPermissionHook,
  deletePermissionHook,
  fetchPermissionsHook,
  fetchRolesHook,
  getRoleByIdHook,
} from "../../utils/RolesHelper";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../Molecules/PageHeader";
import CreatePermissionInput from "../../MainComponents/AddPermssionsToRole/CreatePermissionInput";
import PermissionsTable from "../../MainComponents/AddPermssionsToRole/PermissionsTable";
import CustomizeButton from "../../Atoms/CustomizeButton";

const AddPermissionsToRole = () => {
  const [selected, setSelected] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [fetchedRolePermissions, seetFetchedRolePermissions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPermission, setNewPermission] = useState([
    {
      name: "",
      description: "",
    },
  ]);

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchData = async () => {
    const data = await fetchPermissionsHook();
    setPermissions(data);
    const roleData = await getRoleByIdHook(id);
    const rolePermissionsIds = roleData.role.permissions.map(
      (p) => p.permission_id
    );
    seetFetchedRolePermissions(roleData.role.permissions);
    setSelected(rolePermissionsIds);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const addNewPermission = async () => {
    let temp = [];
    temp.push(newPermission);
    if (
      newPermission.permission_name === "" ||
      newPermission.permission_description === ""
    ) {
      toast.error("please enter the required fields .");
      return null;
    }

    const data = await createPermissionHook(temp);
    if (data.success) {
      toast.success(data.message);
      if (data.data) {
        setPermissions((prev) => [...prev, ...data.data]);
      }
      setNewPermission([{ name: "", description: "" }]);
      setIsAdding(false);
    }
  };

  const handleSubmit = async () => {
    let permissionsIds = selected;
    let roleId = id;
    const data = await addPErmissionsToRoleHook(roleId, permissionsIds);
    if (data.success) {
      toast.success(data.message);
      navigate(-1);
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm max-w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <PageHeader
          header={"Assign Permissions"}
          paragraph={
            "choose or add new permission in the system and you can assign it to the role"
          }
        />

        <CreatePermissionInput
          setIsAdding={setIsAdding}
          isAdding={isAdding}
          setNewPermission={setNewPermission}
          newPermission={newPermission}
          addNewPermission={addNewPermission}
        />
      </div>

      <PermissionsTable
        permissions={permissions}
        selected={selected}
        setSelected={setSelected}
        setPermissions={setPermissions}
      />
      <div className="flex justify-end mt-6">
        <CustomizeButton text={"Add To Role"} onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default AddPermissionsToRole;
