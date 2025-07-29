import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { fetchUsersHook } from '../../utils/UserHelper';
import defaultPhoto from '../../assets/defaultPhoto.png'


const EmpCard = ({ emp }) => {
const {user} = useAuthContext();
const navigate = useNavigate();
  return (
    <div >
        <div 
        
        onClick = {() => navigate(`/adminPage/listEmployees/employee/${emp._id}`)}
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition duration-200 flex flex-col justify-between items-center">
        <img 
            src={emp.profilePicture ? `http://localhost:5000${emp.profilePicture}` : defaultPhoto}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-md"
        />
        <div className="mb-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
            {emp.name} 
            </h3>
            {/* <p className="text-gray-600">{complaint.description}</p> */}
        </div>
            <div>
                <p>{emp.role}</p>
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

    const getEmployees = async()=>{
        const data = await fetchUsersHook();
        console.log(data)
        setEmployees(data);
        setFilteredEmployees(data)
    }

    useEffect(()=>{
        getEmployees();
    },[])

    useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredEmployees(
        employees.filter(emp =>
        emp.name.toLowerCase().includes(lower) ||
        emp.email.toLowerCase().includes(lower)
        )
    );
    }, [search]);
        

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
                <EmpCard key={emp._id} emp = {emp}/>
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