import React, { useEffect, useState } from 'react';
import { addEmployeeToGroupHelper, changeUserRoleHook, fetchUsersHook } from '../../utils/UserHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';
import { useAuthContext } from '../../Context/authContext';
import { fetchRolesHook } from '../../utils/RolesHelper';
import { toast } from 'react-toastify';



const AssignUsersToRole = () => {
const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
    const {user} = useAuthContext()
  const { id } = useParams();
  const navigate = useNavigate();


const fetchEmployees = async () => {
  try {
    setScreenLoading(true);

    const users = await fetchUsersHook();
    let roles2 = users.roles2;

    // Find the target role by ID (use .find instead of .filter if you only want one)
    const targetRole = roles2.find((r) => r._id === id);
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
        String(emp.user._id) !== String(user?._id) && emp.role !== targetRole.role
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
      employees?.filter(emp =>
        emp?.user?.name?.toLowerCase().includes(lower) ||
        emp?.user?.email?.toLowerCase().includes(lower)
      )
    );
  }, [search, employees]);

  const handleAddEmployee = async () => {
    const roles = await fetchRolesHook();
    let filteredRoles = roles.filter((r) => r._id === id)
    // console.log(filteredRoles[0].role)
    const data = await changeUserRoleHook (selectedEmployee , filteredRoles[0].role);
    if(data.success){
        toast.success("employee added successfully")
        navigate(-1)
    }
};

  if (screenLoading) {
    return (
      <div className="max-w-md mx-auto p-8 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl border border-gray-200 space-y-6">
      <h2 className="text-3xl font-bold text-center text-blue-800">Assign Employee to Role </h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      <div className="max-h-96 overflow-y-auto grid grid-cols-1 gap-3">
        {filteredEmployees.length === 0 ? (
          <p className="text-gray-500 text-center">No employees found.</p>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => setSelectedEmployee(emp._id)}
              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer shadow-sm transition hover:shadow-md ${
                selectedEmployee === emp._id ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
            >
                <div className='flex items-center justify-center'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <p className="font-semibold text-gray-800">{emp.user.name}</p>
                            <p className='font-bold text-blue-500 mr-2'>{emp.role}</p>
                        </div>
                        <p className="text-sm text-gray-500">{emp.user.email}</p>
                    </div>
                </div>
                    <input
                        type="radio"
                        checked={selectedEmployee === emp.user._id}
                        onChange={() => setSelectedEmployee(emp.user._id)}
                        className="w-5 h-5 text-blue-600"
                    />
                
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleAddEmployee}
        disabled={loading || !selectedEmployee}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add to Group'}
      </button>
    </div>
  );
}

export default AssignUsersToRole