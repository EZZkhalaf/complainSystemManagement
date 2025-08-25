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

const ComplaintCard = ({ complaint }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  return (
    <div
      onClick={() =>
        navigate(
          `/${user.role === "admin" ? "adminPage" : "userPage"}/complaint/${
            complaint.complaint_id
          }`
        )
      }
      className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition duration-200 flex flex-col justify-between"
    >
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
          {complaint.complaint_type} Complaint
        </h3>
        <p className="text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyles(
            complaint.complaint_status
          )}`}
        >
          {complaint.complaint_status}
        </span>
        <div className="text-sm text-gray-500 text-right">
          <p className="font-medium">
            {new Date(complaint.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const getStatusStyles = (status) => {
  const styles = {
    resolved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

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

  // console.log(employee)
  useEffect(() => {
    if (employee?.role) {
      setSelectedRole(selectedRole); // sync role after data is fetched
    }
  }, [employee]);

  return (
    <div className="max-w-full mx-auto p-6 sm:p-10 bg-white rounded-3xl shadow-xl  border border-gray-200">
      <div className="flex justify-end mb-4">
        {hasPermission(user, "edit_employee") && selectedRole !== "admin" && (
          <div>
            {/* {user.permissions.editUsers && ( */}
            <button
              onClick={() => setEditing((prev) => !prev)}
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition mr-4"
            >
              {editing ? "Cancel Edit" : "Edit"}
            </button>
            {/* )} */}
          </div>
        )}

        {editing && (
          <button
            onClick={handleSaveChanges}
            className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition "
          >
            Save Changes
          </button>
        )}
      </div>
      <div className="flex  justify-between w-full sm:flex-row  sm:items-start ">
        <div className="flex  w-full">
          <div className="mr-5">
            <img
              src={
                employee?.profilePicture
                  ? `http://localhost:5000${employee.profilePicture}`
                  : defaultPhoto
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex text-center  sm:text-left">
              {!editing ? (
                <div className="flex flex-col ">
                  <h2 className="flex text-2xl  font-bold text-blue-800 capitalize">
                    {employee?.user_name}
                  </h2>
                  <p className="text-gray-600 mt-1">{employee?.user_email}</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center ">
                    <p className=" text-black font-bold mr-2"> Name :</p>
                    <input
                      type="text"
                      name="editableName"
                      id="editableName"
                      className="border rounded-lg  py-1 text-xl font-semibold  capitalize"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center ">
                    <p className=" text-black font-bold mr-2"> Email :</p>
                    <input
                      type="email"
                      name="editableEmail"
                      id="editableEmail"
                      className="border rounded-lg  py-1 mt-1 text-xl font-semibold  capitalize"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center ">
                    <p className=" text-black font-bold mr-2"> Pass :</p>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Change User Password"
                      className="border rounded-lg px-3 py-1 mt-2 text-gray-700"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center bg-gray-50  rounded-xl ">
              <div className="flex flex-col  ">
                <div className="flex  ">
                  <span className=" capitalize text-xl flex flex-col  text-md ">
                    <div className="flex  ">
                      {editing ? (
                        <div className="flex items-center ">
                          <p className=" text-black font-bold mr-2"> Role :</p>
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="border rounded px-2 py-1 text-md"
                          >
                            {roles.map((role) => (
                              <option key={role.role_id} value={role.role_name}>
                                {role.role_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p>{selectedRole}</p>
                      )}
                    </div>
                  </span>
                </div>

                <div className="flex items-center w-full">
                  <p className="text-center text-m text-gray-500">
                    Created At :
                  </p>
                  <p className="text-gray-700 font-medium ml-2">
                    {employee?.created_at?.slice(0, 10) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {employee && <EmpoyeeLeavesChartSummary user={employee} />}
      </div>
      <div className="mt-2 space-y-4">
        <h1 className="flex text-xl text-gray-500 ">Groups : </h1>

        {/* groups listing */}
        {groups && groups.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {groups.map((g) => (
              <div
                key={g._id}
                onClick={() =>
                  navigate(
                    `/${
                      user.role === "admin" ? "adminPage" : "userPage"
                    }/current-group/${g.group_id}`
                  )
                }
                className="p-6 bg-gray-200 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2 capitalize truncate">
                  {g.group_name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  Members:{" "}
                  <span className="font-medium">{g.users?.length || 0}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Created at:{" "}
                  <span className="font-medium">
                    {g.created_at ? g.created_at.slice(0, 10) : "N/A"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-gray-500 italic text-lg">
              This user is not in any group at the moment.
            </p>
          </div>
        )}

        {hasPermission(user, "view-leaves") && (
          <div>
            <h1 className=" flex text-xl text-gray-500">Employee Leaves :</h1>
            <EmployeeLeaves user={employee} />
          </div>
        )}

        {/* complaint listing */}
        <h1 className=" flex text-xl text-gray-500">Complaints : </h1>
        {complaints.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {[...complaints]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort newest first
              .map((complaint) => (
                <ComplaintCard
                  key={complaint.complaint_id}
                  complaint={complaint}
                />
              ))}
          </div>
        ) : (
          <div className="text-center mt-6">
            <p className="text-gray-600 italic">
              This user does not have any complaints at the moment{" "}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;
