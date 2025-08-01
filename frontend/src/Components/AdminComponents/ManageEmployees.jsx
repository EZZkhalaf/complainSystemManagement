import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { fetchUsersHook } from '../../utils/UserHelper';
import defaultPhoto from '../../assets/defaultPhoto.png'
import { toast } from 'react-toastify';


const EmpCard = ({ emp }) => {
const {user} = useAuthContext();
const navigate = useNavigate();
  return (
    <div>
      <div
        // onClick={() => navigate(`/adminPage/listEmployees/employee/${emp.user._id}`)}
        onClick={() => navigate(`/${user.role === 'admin' ? "adminPage" : "userPage"}/listEmployees/employee/${emp?.user?._id}`)}
        className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-200 flex flex-col justify-between items-center cursor-pointer group"
      >
        <img
          src={emp.user.profilePicture ? `http://localhost:5000${emp?.user?.profilePicture}` : defaultPhoto}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
        />

        <div className="mt-4 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
            {emp.user.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{emp.user.email}</p>
        </div>

        <div className="mt-3">
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize font-medium">
            {emp.role}
          </span>
        </div>
      </div>
    </div>


  );
};

const ManageEmployees = () => {
    const { user} = useAuthContext();
    const [search , setSearch] = useState("")
    const [employees , setEmployees] = useState([])
    const [filteredEmployees , setFilteredEmployees] = useState(employees)



const getEmployees = async () => {
  try {
    const  roles  = await fetchUsersHook();

    let updatedUsers = roles.users;
    updatedUsers = updatedUsers.filter((emp) => user._id !== emp.user._id)
    setEmployees(updatedUsers);
    setFilteredEmployees(updatedUsers);
  } catch (error) {
    console.error("Error fetching employees:", error);
    toast.error("Failed to load employees.");
  }
};




    useEffect(()=>{
        getEmployees();
    },[])

    useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredEmployees(
        employees.filter(emp =>
        (emp.user.name.toLowerCase().includes(lower) ||
        emp.user.email.toLowerCase().includes(lower))  )
    );
    }, [search , employees]);
        
// console.log(employees)
  return (
    <div className="max-w-full mx-auto p-8 bg-white shadow-2xl rounded-3xl border border-gray-200 space-y-6">
        <h2 className="text-3xl font-bold text-center text-blue-800">Add Employee to Group</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      {filteredEmployees ? (
        <div>
            <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredEmployees.map((emp) => (
                <EmpCard key={emp.user._id} emp = {emp}/>
            ))}
            </div>
        </div>
      ) : (
        <div className='flex justify-center'>
            <p className='text-gray-600'>no employees available at the moment </p>
        </div>
      )}
    </div>
  )
}

export default ManageEmployees