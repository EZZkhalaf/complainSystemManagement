import React, { useEffect, useState } from "react";
import defaultPhoto from "../../assets/defaultPhoto.png";
import { useNavigate, useParams } from "react-router-dom";
import { useScroll } from "framer-motion";
import {
  adminUpdateUserInfoHook,
  changeUserRoleHook,
  getUserByIdHook,
} from "../../utils/UserHelper";
import { toast } from "react-toastify";
import { useAuthContext } from "../../Context/authContext";
import { fetchRolesHook } from "../../utils/RolesHelper";
import { hasPermission } from "../../utils/AuthHooks";
import EmployeeLeaves from "./Leaves/EmployeeLeaves";
import EmpoyeeLeavesChartSummary from "./Leaves/EmpoyeeLeavesChartSummary";
import EmployeePageEditButton from "../../Molecules/EmployeePageEditButton";
import EmployeeDetails from "../../MainComponents/EmployeeInfo/EmployeeDetails";
import PageHeader from "../../Molecules/PageHeader";
import GroupsTable from "../../MainComponents/ListGroups/GroupsTable";
import ComplaintListing from "../../MainComponents/ComplaintsList.jsx/ComplaintsListing";

const EmployeeInfo = () => {
  const { id } = useParams();

  const { user } = useAuthContext();
  const [employee, setEmployee] = useState(null);
  const [groups, setGroups] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [roles, setRoles] = useState([]);

  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(
    employee?.user_role.role_name || "User"
  );
  const [editableName, setEditableName] = useState(employee?.user_name);
  const [editableEmail, setEditableEmail] = useState(employee?.user_email);
  const [newPassword, setNewPassword] = useState("");

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const userId = id;
    const newRole = selectedRole;

    if (employee.role !== selectedRole) {
      const data = await changeUserRoleHook(userId, newRole);
      if (data.success) {
        setSelectedRole(newRole);
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    }

    if (
      editableEmail !== employee.email ||
      editableName !== employee.name ||
      newPassword.trim() !== ""
    ) {
      const newName = editableName;
      const newEmail = editableEmail;
      const adminId = user._id;

      const data = await adminUpdateUserInfoHook(
        adminId,
        userId,
        newName,
        newEmail,
        newPassword
      );

      if (data.success) {
        toast.success(data.message);
        setEmployee((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            name: newName,
            email: newEmail,
          },
        }));
      } else {
        toast.error(data.message);
      }
    }

    setEditing(false);
  };
  const getUserData = async () => {
    const data = await getUserByIdHook(id);
    const roles = await fetchRolesHook();
    setRoles(roles.map(({ user, ...rest }) => rest));

    if (!data || !data.user || data.user.length === 0) return;

    const user1 = data.user;
    setEmployee(user1);
    setGroups(data.groups);
    setComplaints(data.complaints);
    setSelectedRole(data.role);

    setEditableName(user1.name);
    setEditableEmail(user1.email);
  };
  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (employee?.role) {
      setSelectedRole(selectedRole); // sync role after data is fetched
    }
  }, [employee]);
  return (
    <div className="max-w-full mx-auto p-6 sm:p-10 bg-gray-50   ">
      <PageHeader
        header={"Employee Info"}
        paragraph={
          "Here you can view the employee detaills and complaints and leaves and also groups"
        }
      />
      <EmployeePageEditButton
        selectedRole={selectedRole}
        setEditing={setEditing}
        handleSaveChanges={handleSaveChanges}
        editing={editing}
      />
      <div className="grid lg:grid-cols-2 grid-cols-1 sm  justify-around sm:flex-row  sm:items-start ">
        <EmployeeDetails
          employee={employee}
          setEditableEmail={setEditableEmail}
          setEditableName={setEditableName}
          setSelectedRole={setSelectedRole}
          setNewPassword={setNewPassword}
          roles={roles}
          selectedRole={selectedRole}
          editableEmail={editableEmail}
          editableName={editableName}
          newPassword={newPassword}
          editing={editing}
          defaultPhoto={defaultPhoto}
        />
        {employee && <EmpoyeeLeavesChartSummary user={employee} />}
      </div>
      <div className="mt-2 space-y-4">
        <h1 className="flex text-xl text-gray-500 ">Groups : </h1>

        <GroupsTable groups={groups} />

        {hasPermission(user, "view-leaves") && (
          <div>
            <h1 className=" flex text-xl text-gray-500">Employee Leaves :</h1>
            <EmployeeLeaves user={employee} />
          </div>
        )}

        <h1 className=" flex text-xl text-gray-500">Complaints : </h1>

        <ComplaintListing filtered={complaints} />
      </div>
    </div>
  );
};

export default EmployeeInfo;
