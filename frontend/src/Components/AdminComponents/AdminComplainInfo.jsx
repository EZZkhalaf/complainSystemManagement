import React, { useEffect, useState } from 'react'
import { changeComplaintStatusHook, deleteComplaintHook, getComaplintInfoHook } from '../../utils/ComplaintsHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';
import { OrbitProgress } from 'react-loading-indicators';

const AdminComplainInfo = () => {
  const [complaint, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStatus , setNewStatus] = useState("");
  const {id} = useParams();
  const {user} = useAuthContext();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
        setLoading(true)
      const response = await getComaplintInfoHook(id)
      setComplaints(response);
      setNewStatus(response.status)
    } catch (err) {
        console.error('Error fetching complaints:', err);
    } finally {
        setLoading(false);
    }
};

const changeComaplaintStatus = async(e , value) =>{
    let complaintId = id 
    let userId = user._id
    
    let status = value
    

    const data = await changeComplaintStatusHook(complaintId , status , userId)
    setComplaints(data);
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
//   console.log(newStatus)
return (
  <div className="max-w-4xl mx-auto p-6">
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate("/adminPage/complaints")}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 hover:text-blue-900 transition"
      >
        Back to Complaints
      </button>


      {user.permissions.deleteComplaints && (
        <button
          onClick={handleDeleteComplaint}
          className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Delete Complaint
        </button>
      )}


    </div>

    <h1 className="text-3xl font-bold text-blue-800 mb-6">Complaint Details</h1>

    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <div>
        <span className="block font-medium text-gray-700">User:</span>
        <div 
         onClick={()=>navigate(`/adminPage/listEmployees/employee/${complaint?.userId?._id}`)}>
        <span className="text-gray-900 bg-gray-400 p-1 rounded-full hover:bg-gray-600 hover:text-white ">{complaint.userId?.name || 'Unknown'}</span>
        </div>
      </div>

      <div>
        <span className="block font-medium text-gray-700">Type:</span>
        <span className="capitalize text-gray-800">{complaint.type}</span>
      </div>

      <div>
        <span className="block font-medium text-gray-700">Description:</span>
        <p className="text-gray-800 mt-1 text-sm">{complaint.description}</p>
      </div>

      <div>
        <span className="block font-medium text-gray-700">Assigned Admin:</span>
        <span className="text-gray-700">{complaint.complaintAdmin?.name || 'Not Assigned'}</span>
      </div>

      <div>
        <span className="block font-medium text-gray-700">Status:</span>
        {complaint.status === "pending" ? (
          <select
            className="mt-1 px-3 py-2 border rounded-md text-sm text-gray-800 bg-white"
            defaultValue={complaint.status}
            onChange={(e) => {
              let value = e.target.value;
              changeComaplaintStatus(e, value);
            }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        ) : (
          <span
            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
              complaint.status
            )}`}
          >
            {complaint.status}
          </span>
        )}
      </div>
    </div>
  </div>
);

    
}

export default AdminComplainInfo