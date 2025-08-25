import React, { useEffect, useState } from 'react';
import { getUserLeaves } from '../../../utils/LeavesHelper';
import { useAuthContext } from '../../../Context/authContext';
import { useNavigate } from 'react-router-dom';

const LeavesTable = () => {
    const [leaves , setLeaves] = useState([])  
    const {user} = useAuthContext()
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1);
    const leavesPerPage = 8; 
    const [totalLeaves , setTotalLeaves] = useState(0)
  
  const indexOfLastLeave = currentPage * leavesPerPage;
  const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;
  const currentLeaves = leaves.slice(indexOfFirstLeave, indexOfLastLeave);

  const totalPages = Math.ceil(totalLeaves / leavesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const fetchLeaves = async()=>{
    const response = await getUserLeaves(user._id , currentPage , leavesPerPage)
    console.log(response)
    setLeaves(response.leaves )
    setCurrentPage(response.currentPage)
    setTotalLeaves(response.totalLeaves)
  }
  useEffect(()=>{
    fetchLeaves();
  },[currentPage])
  return (
    <div className="p-6">
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                    {['ID', 'Description', 'Type', 'Status', 'User', 'Handler', 'Created At', 'Updated At'].map((header) => (
                        <th
                        key={header}
                        className="text-left px-6 py-3 text-gray-600 font-medium uppercase tracking-wider"
                        >
                        {header}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave, idx) => (
                    <tr
                        key={leave.leave_id}
                        className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                    >
                        <td className="px-6 py-3 text-gray-700">{leave.leave_id}</td>
                        <td className="px-6 py-3 text-gray-700">{leave.leave_description}</td>
                        <td className="px-6 py-3 capitalize text-gray-700">{leave.leave_type}</td>
                        <td className="px-6 py-3">
                        <span
                            className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            leave.leave_status === 'pending'
                                ? 'bg-yellow-500'
                                : leave.leave_status === 'accepted'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                        >
                            {leave.leave_status}
                        </span>
                        </td>
                        <td className="px-6 py-3 text-gray-700">{leave.leave_user_name}</td>
                        <td className="px-6 py-3 text-gray-700">{leave.leave_handler_name || "NA"}</td>
                        <td className="px-6 py-3 text-gray-500 text-sm">
                            {new Date(leave.created_at).toLocaleDateString('en-US' , {
                                year: "numeric",
                                month: "short",
                                day: "numeric", 
                                hour : 'numeric' ,
                                minute : "numeric"
                            })}
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-sm">
                            {new Date(leave.updated_at).toLocaleDateString('en-US' , {
                                year: "numeric",
                                month: "short",
                                day: "numeric", 
                                hour : 'numeric' ,
                                minute : "numeric"
                            })}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
            <div className="flex justify-center items-center mt-4 space-x-4">
                <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
                >
                Previous
                </button>
                <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
                </span>
                <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
                >
                Next
                </button>
            </div>
    </div>

  );
};

export default LeavesTable;
