import React, { useEffect, useState } from "react";
import {
  addEmployeeToGroupHelper,
  changeUserRoleHook,
  fetchUsersHook,
} from "../../utils/UserHelper";
import { useNavigate, useParams } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import { useAuthContext } from "../../Context/authContext";
import { fetchRolesHook } from "../../utils/RolesHelper";
import { toast } from "react-toastify";
import PageLoading from "../../Atoms/PageLoading";
import ListEmployees from "../../MainComponents/ManageEmployees/ListEmployees";
import PageHeader from "../../Molecules/PageHeader";
import { Input } from "@headlessui/react";
import InputText from "../../Atoms/InputText";

const AssignUsersToRole = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const { user } = useAuthContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setScreenLoading(true);

      const users = await fetchUsersHook();
      let roles2 = users.roles2;
      // console.log(users)

      const targetRole = roles2.find((r) => r.role_id === Number(id));
      if (!targetRole) {
        console.warn("Role with the given ID not found");
        setEmployees([]);
        setFilteredEmployees([]);
        setScreenLoading(false);
        return;
      }

      // Filter users: exclude current user and match the target role
      let user2 = users.users || [];
      user2 = user2.filter(
        (emp) =>
          emp.user.user_id !== user?.user_id && emp.role !== targetRole.role
      );

      setEmployees(user2);
      setFilteredEmployees(user2);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setScreenLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredEmployees(
      employees?.filter(
        (emp) =>
          emp?.user?.user_name?.toLowerCase().includes(lower) ||
          emp?.user?.user_email?.toLowerCase().includes(lower)
      )
    );
  }, [search, employees]);

  const handleAddEmployee = async () => {
    const roles = await fetchRolesHook();
    let filteredRoles = roles.filter((r) => r.role_id === Number(id));
    // console.log(filteredRoles[0].role)
    const data = await changeUserRoleHook(
      selectedEmployee,
      filteredRoles[0].role_name
    );
    if (data.success) {
      toast.success("employee added successfully");
      navigate(-1);
    }
  };

  if (screenLoading) {
    return <PageLoading />;
  }

  return (
    <div className=" mx-auto  bg-white shadow-2xl rounded-3xl border border-gray-200 space-y-6">
      <PageHeader
        header={"Assign Employee"}
        paragraph={` you can choose any emplloyee and assign him/her to the desired role , this action will be recorded in the logs`}
      />

      <InputText
        type={"name"}
        setTarget={setSearch}
        value={search}
        width={"w-4xl"}
      />

      <ListEmployees filteredEmployees={filteredEmployees} />

      <button
        onClick={handleAddEmployee}
        disabled={loading || !selectedEmployee}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add to Group"}
      </button>
    </div>
  );
};

export default AssignUsersToRole;
