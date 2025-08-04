import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { fetchUsersHook } from '../../utils/UserHelper';
import defaultPhoto from '../../assets/defaultPhoto.png';
import { toast } from 'react-toastify';
import { OrbitProgress } from 'react-loading-indicators';

const EmpCard = ({ emp }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/${user.role === 'admin' ? "adminPage" : "userPage"}/listEmployees/employee/${emp?.user?._id}`)
      }
      className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-200 flex flex-col items-center cursor-pointer group"
    >
      <img
        src={emp.user.profilePicture ? `http://localhost:5000${emp?.user?.profilePicture}` : defaultPhoto}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
      />

      <div className="mt-4 text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">{emp.user.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{emp.user.email}</p>
      </div>

      <div className="mt-3">
        <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize font-medium">
          {emp.role}
        </span>
      </div>
    </div>
  );
};

const ManageEmployees = () => {
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading , setLoading] = useState(false)

  const getEmployees = async () => {
    setLoading(true);
    try {
      const roles = await fetchUsersHook();
      console.log(roles)
      let updatedUsers = roles.users.filter(emp => user._id !== emp.user._id)
       .filter(emp => emp.role !== 'admin');
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
      employees.filter(emp =>
        emp.user.name.toLowerCase().includes(lower) || emp.user.email.toLowerCase().includes(lower)
      )
    );
  }, [search, employees]);

  if(loading) return(
            <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )

  return (
    <div className="max-w-7xl mx-auto  ">
      <div className=" rounded-2xl  p-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Employees</h1>
          <p className="text-gray-600 max-w-xl">
            Easily view employee profiles, update their information, and assign roles to control access and responsibilities across the system.
          </p>
        </div>


        {/* Search Input */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Employee List */}
        {filteredEmployees && filteredEmployees.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEmployees.map((emp) => (
              <EmpCard key={emp.user._id} emp={emp} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500 text-lg italic">No employees found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEmployees;
