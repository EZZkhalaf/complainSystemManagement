import React, { useState, useEffect } from 'react';
import { getLogsHook } from '../../utils/LogsHelper';
import { OrbitProgress } from 'react-loading-indicators';



const LOGS_PER_PAGE = 10;

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages , setTotalPages] = useState(1);

  const [ user , setUser ] = useState("");
  const [ action , setAction] = useState("");
  const [ resource , setResource ] = useState("");

  const [loading , setLoading] = useState(false)


  const fetchLogs = async() =>{
    // setLoading(true);
    const data = await getLogsHook(currentPage , LOGS_PER_PAGE , {action , resource , user})
    setLogs(data.data);
    setTotalPages(Math.ceil(data.totalPages ));
    // setLoading(false)
  }
  useEffect(() => {
        fetchLogs()
  }, [currentPage , action , resource , user]);


   const handleFilterChange = ()=>{
    setCurrentPage(1)
   }
  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === 'prev' && prev > 1) return prev - 1;
      if (direction === 'next' && prev < totalPages) return prev + 1;
      return prev;
    });
  };
  if(loading) return(
            <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
  <h2 className="text-3xl font-bold mb-6 text-gray-800">Company Logs</h2>

          {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by user..."
          value={user}
          onChange={(e) => {e.preventDefault(); setUser(e.target.value); handleFilterChange(); }}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />

        <select
          value={action}
          onChange={(e) => {e.preventDefault(); setAction(e.target.value); handleFilterChange(); }}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">All Actions</option>
          <option value="Login">Login</option>
          <option value="Add-Permission">Add-Permission</option>
          <option value="Delete-Role">Delete-Role</option>
          <option value="Delete-Group">Delete-Group</option>
          <option value="Add-User">Add-User</option>
          <option value="Edit-Rule">Edit-Rule</option>
          <option value="Leave-Action">Leave-Action</option>
        </select>

        <select
          value={resource}
          onChange={(e) => { setResource(e.target.value); handleFilterChange(); }}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">All Resources</option>
          <option value="User">User</option>
          <option value="Permission">Permission</option>
          <option value="Role">Role</option>
          <option value="Group">Group</option>
          <option value="Complaint">Complaint</option>
        </select>
      </div>


  <div className="overflow-x-auto shadow rounded-lg bg-white">
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
        <tr>
          <th className="px-6 py-3 border-b">#</th>
          <th className="px-6 py-3 border-b">User</th>
          <th className="px-6 py-3 border-b">Action</th>
          <th className="px-6 py-3 border-b">Resource</th>
          <th className="px-6 py-3 border-b">Message</th>
          <th className="px-6 py-3 border-b">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={log._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 border-b">{(currentPage - 1) * LOGS_PER_PAGE + index + 1}</td>
            <td className="px-6 py-4 border-b">{log?.user?.user_name || 'Unknown'}</td>
            <td className="px-6 py-4 border-b text-blue-600 font-medium">{log?.action}</td>
            <td className="px-6 py-4 border-b">{log?.resource}</td>
            <td className="px-6 py-4 border-b">{log?.message}</td>
            <td className="px-6 py-4 border-b text-gray-500">
              {new Date(log?.timestamp).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="flex justify-between items-center mt-6">
    <button
      onClick={() => handlePageChange('prev')}
      disabled={currentPage === 1}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition"
    >
      Previous
    </button>

    <span className="text-sm text-gray-700 font-medium">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() => handlePageChange('next')}
      disabled={currentPage === totalPages}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition"
    >
      Next
    </button>
  </div>
</div>

  );
};

export default ViewLogs;

