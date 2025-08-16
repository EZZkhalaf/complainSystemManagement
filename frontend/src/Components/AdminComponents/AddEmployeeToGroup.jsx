

import React, { useEffect, useState } from 'react';
import { addEmployeeToGroupHelper, fetchUsersHook } from '../../utils/UserHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';
import { useAuthContext } from '../../Context/authContext';

const AddEmployeeToGroup = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const{user} = useAuthContext();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchEmployees = async () => {
    setScreenLoading(true);
    const data = await fetchUsersHook();

    console.log(data)
    if (!data) {
      setEmployees([]);
      setFilteredEmployees([]);
      setScreenLoading(false);
      return;
    }

    // Combine both arrays into one list (you can adjust this as needed)
    let combinedUsers = [...data.users];

combinedUsers = combinedUsers.filter(emp => emp.user.user_id !== user.user_id);
    console.log("combined users :  ",combinedUsers)
    setEmployees(combinedUsers);
    setFilteredEmployees(combinedUsers);
    setScreenLoading(false);
  };

  fetchEmployees();
}, []);

console.log(employees)

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredEmployees(
      employees?.filter(emp =>
        emp?.user.user_name.toLowerCase().includes(lower) ||
        emp?.user.user_email.toLowerCase().includes(lower)
      )
    );
  }, [search, employees]);

  const handleAddEmployee = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    await addEmployeeToGroupHelper(id, selectedEmployee, navigate);
    setLoading(false);
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
      <h2 className="text-3xl font-bold text-center text-blue-800">Add Employee to Group</h2>

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
              key={emp?.user.user_id}
              onClick={() => setSelectedEmployee(emp.user.user_id)}
              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer shadow-sm transition hover:shadow-md ${
                selectedEmployee === emp._id ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{emp.user.user_name}</p>
                <p className="text-sm text-gray-500">{emp.user.user_email}</p>
              </div>
              <input
                type="radio"
                checked={selectedEmployee === emp?.user.user_id}
                onChange={() => setSelectedEmployee(emp?.user.user_id)}
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
};

export default AddEmployeeToGroup;
