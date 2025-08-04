import React, { useEffect, useState } from 'react'
import { changeComplaintStatusHook, deleteComplaintHook, getComaplintInfoHook, handleComplaintInGroupHook } from '../../utils/ComplaintsHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { OrbitProgress } from 'react-loading-indicators';
import { toast } from 'react-toastify';
import { hasPermission } from '../../utils/AuthHooks';
import { listGroupsHook } from '../../utils/GroupsHelper';



const ComplaintInfo = () => {
    const [complaint, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStatus , setNewStatus] = useState("");
  const [groups , setGroups] = useState([])
  const [ selectedGroup , setSelectedGroup] = useState("");
  const {id} = useParams();
  const {user} = useAuthContext();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
        setLoading(true)
      const response = await getComaplintInfoHook(id)
      setComplaints(response);
      setNewStatus(response.status)
      const gData  = await listGroupsHook(user._id)
      console.log(gData)
      setGroups(gData)
    } catch (err) {
        console.error('Error fetching complaints:', err);
    } finally {
        setLoading(false);
    }
};


const changeComaplaintStatus = async(e) =>{
    let complaintId = id 
    let userId = user._id
    // console.log(newStatus)
    const data = await handleComplaintInGroupHook(complaintId , userId , selectedGroup ,newStatus)
    if(data.success){
        navigate(`/${user.role === 'admin' ? 'adminPage' : 'userPage'}/groupsForComplaints`)
    }


}


const handleDeleteComplaint = async () => {
  if (!window.confirm("Are you sure you want to delete this complaint?")) return; 
  await deleteComplaintHook(complaint._id, user._id , navigate);
};

useEffect(() => {
    fetchComplaints();
}, []);

  if(loading) return(
            <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

return (
  <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-gray-50 min-h-screen">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={() => navigate(`/${user.role === 'admin' ? "adminpage" : "userPage"}/complaints`)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 hover:text-blue-900 transition"
      >
        Back to Complaints
      </button>

      {(hasPermission("delete_complaint") || user.role === 'admin') && (
        <button
          onClick={handleDeleteComplaint}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition"
        >
          Delete Complaint
        </button>
      )}
    </div>

    {/* Title */}
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Complaint Details</h1>

    {/* Complaint Card */}
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">

      {/* User Info */}
      <div>
        <p className="text-gray-600 font-medium mb-1">User:</p>
        {hasPermission(user, "view_employees") ? (
          <span
            onClick={() => navigate(`/${user.role === 'admin' ? "adminPage" : "userPage"}/listEmployees/employee/${complaint?.userId?._id}`)}
            className="inline-block cursor-pointer px-3 py-1 rounded-full bg-gray-200 text-gray-900 hover:bg-gray-800 hover:text-white transition"
          >
            {complaint?.userId?.name || 'Unknown'}
          </span>
        ) : (
          <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900">
            {complaint?.userId?.name || 'Unknown'}
          </span>
        )}
      </div>

      {/* Type */}
      <div>
        <p className="text-gray-600 font-medium mb-1">Type:</p>
        <span className="capitalize text-gray-800">{complaint.type}</span>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600 font-medium mb-1">Description:</p>
        <p className="text-gray-800 text-sm leading-relaxed">{complaint.description}</p>
      </div>

      {/* Status */}
      <div>
        <p className="text-gray-600 font-medium mb-2">Status:</p>
        {(complaint.status === "pending" || complaint.status === "in-progress") ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Status Select */}
            <select
              className="w-full sm:w-auto px-4 py-2 border rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              defaultValue={complaint.status}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Group Select */}
            <select
              className="w-full sm:w-auto px-4 py-2 border rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-40 overflow-y-auto"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              onClick={changeComaplaintStatus}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
            >
              Submit
            </button>
          </div>
        ) : (
          <span
            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(complaint.status)}`}
          >
            {complaint.status}
          </span>
        )}
      </div>
    </div>
  </div>
);


    
}

export default ComplaintInfo