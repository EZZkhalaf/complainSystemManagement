import React, { useEffect, useState } from 'react';
import { addEmployeeToGroupHelper, fetchUsersHook } from '../../utils/UserHelper';
import { useNavigate, useParams } from 'react-router-dom';
import {OrbitProgress} from 'react-loading-indicators'
const AddEmployeeToGroup = ({ groupId }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenLoading , setScreenLoading] = useState(false)
    const {id} =useParams();

    const navigate = useNavigate();
  // Fetch employees not in the group
  useEffect(() => {
    const fetchEmployees = async () => {
        setScreenLoading(true)
        const users = await fetchUsersHook();
        setEmployees(users)
        setScreenLoading(false)
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!selectedEmployee) return;
    let groupId = id;
    let userId = selectedEmployee
    await addEmployeeToGroupHelper(groupId , userId , navigate)

  };

  
  if(screenLoading) return(
            <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )
  return (
        <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl rounded-3xl border border-gray-200 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-blue-800">Add Employee to Group</h2>

        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
            Select an Employee
            </label>
            <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
            <select
                size={5}
                className="w-full bg-white px-4 py-2 text-gray-800 focus:outline-none cursor-pointer"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
            >
                <option value="" disabled>
                Choose an employee
                </option>
                {employees.map((emp) => (
                <option
                    key={emp._id}
                    value={emp._id}
                    className="text-gray-900 hover:bg-blue-100"
                >
                    {emp.name} ({emp.email})
                </option>
                ))}
            </select>
            </div>
        </div>

        <button
            onClick={handleAddEmployee}
            disabled={loading || !selectedEmployee}
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Adding...' : 'Add to Group'}
        </button>
        </div>


  );
};

export default AddEmployeeToGroup;
