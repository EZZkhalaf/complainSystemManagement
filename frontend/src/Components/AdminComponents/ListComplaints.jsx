import React, { useEffect, useState } from 'react';
import { listComplaintsHook } from '../../utils/ComplaintsHelper';
import { useAuthContext } from '../../Context/authContext';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';

// Dynamic styles for complaint status
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
  const { user } = useAuthContext();

  
  return (
    <div
      onClick={() => {
        const path =
          user.role === 'admin'
            ? `/adminPage/complaint/${complaint._id}`
            : `/userPage/otherComplaint/${complaint._id}`;
        navigate(path);
      }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 capitalize">
          {complaint.type} Complaint
        </h3>
        <p className="text-sm text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyles(
            complaint.status
          )}`}
        >
          {complaint.status}
        </span>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{complaint.userId?.name}</p>
          <p className="text-xs text-gray-500">{complaint.userId?.email}</p>
        </div>
      </div>
    </div>
  );
};

const ListComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuthContext();
  const [loading , setLoading] = useState(false)
  const fetchComplaints = async () => {
    setLoading(true)
    try {

      const data = await listComplaintsHook(user._id);
      setComplaints(data.complaints);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints
    .filter((comp) => comp.userId._id !== user._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if(loading) return(
            <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Complaints</h1>
        <p className="text-gray-600 max-w-2xl">
          Explore and review complaints submitted by employees. Click on a complaint to view details, track progress, and manage resolutions.
        </p>
      </div>

      {/* Complaint Grid */}
      {filteredComplaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListComplaints;
