import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { fetchUsersHook } from "../../utils/UserHelper";
import { toast } from "react-toastify";
import { OrbitProgress } from "react-loading-indicators";
import PageHeader from "../../Molecules/PageHeader";
import InputText from "../../Atoms/InputText";
import ListEmployees from "../../MainComponents/ManageEmployees/ListEmployees";

const ManageEmployees = () => {
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const getEmployees = async () => {
    setLoading(true);
    try {
      const roles = await fetchUsersHook();
      let updatedUsers = roles.users
        .filter((emp) => user.user_id !== emp.user.user_id)
        .filter((emp) => emp.user_role !== "admin");
      setEmployees(updatedUsers);
      setFilteredEmployees(updatedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees.");
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredEmployees(
      employees.filter(
        (emp) =>
          emp.user.user_name.toLowerCase().includes(lower) ||
          emp.user.user_email.toLowerCase().includes(lower)
      )
    );
  }, [search, employees]);

  if (loading)
    return (
      <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto  ">
      <div className=" rounded-2xl  p-10 space-y-10">
        <PageHeader
          header={"Manage Employees"}
          paragraph={`
            Easily view employee profiles, update their information, and assign
            roles to control access and responsibilities across the system.  
          `}
        />

        <div className="flex justify-center">
          <InputText
            type={"text"}
            setTarget={setSearch}
            value={search}
            width={"w-full"}
          />
        </div>

        <ListEmployees filteredEmployees={filteredEmployees} />
      </div>
    </div>
  );
};

export default ManageEmployees;
