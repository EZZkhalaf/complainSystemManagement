import React, { useEffect, useState } from 'react';
import { listComplaintsHook, ListUserComplaintsHook } from '../../utils/ComplaintsHelper';
import { useAuthContext } from '../../Context/authContext';
import { useNavigate } from 'react-router-dom';

const getStatusStyles = (status) => {
  const styles = {
    resolved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/userPage/complaint/${complaint._id}`)}
      className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition duration-200 flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
          {complaint.type} Complaint
        </h3>
        <p className="text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyles(complaint.status)}`}>
          {complaint.status}
        </span>
        <div className="text-sm text-gray-500 text-right">
          <p className="font-medium">{complaint.userId?.name}</p>
          <p className="text-xs">{complaint.userId?.email}</p>
        </div>
      </div>
    </div>
  );
};

const ListUserComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const { user } = useAuthContext();
  
    const fetchComplaints = async () => {
      try {
        const data = await ListUserComplaintsHook(user._id);
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
  
    useEffect(() => {
      fetchComplaints();
    }, []);
  
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">Your Complaints</h1>
  
        {complaints?.length === 0 ? (
          <p className="text-center text-gray-600">No complaints found.</p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints?.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    );
}

export default ListUserComplaints