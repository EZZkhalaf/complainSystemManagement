import React, { useEffect, useState } from 'react';
import { listComplaintsHook } from '../../utils/ComplaintsHelper';
import { useAuthContext } from '../../Context/authContext';
import { useNavigate, useParams } from 'react-router-dom';
import { listGroupComplaintsHook } from '../../utils/GroupsHelper';

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
            ? `/adminPage/groupsForComplaints/complaint/${complaint._id}`
            : `/userPage/groupsForComplaints/complaint/${complaint._id}`;
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

const ComplaintsList = () => {
   const [complaints, setComplaints] = useState([]);
   const [groups , setGroups] = useState([])
   const [statusFilter , setStatusFilter] = useState("");
   const [typeFilter , setTypeFilter] = useState("");

   const [page , setPage] = useState(1)
   const [totalPages , setTotalPages] = useState(1);

    const { user } = useAuthContext();
    const {id} = useParams();//groupId
  
    const fetchComplaints = async () => {
      try {
        const data = await listGroupComplaintsHook(id, user._id, {
            type: typeFilter,
            status: statusFilter,
            page,
            limit: 10
        });
        setComplaints(data.complaints);
        setTotalPages(data.totalPages)
        
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
      const filtered = complaints
    .filter((comp) => comp.userId._id !== user._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const fetchGroups = async() =>{

    }
  
    useEffect(() => {
      fetchComplaints();
      fetchGroups();
    }, [typeFilter , statusFilter , page]);
  
    const filteredComplaints = complaints
      .filter((comp) => comp.userId._id !== user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaints</h1>
        <p className="text-gray-600 max-w-2xl">
          Explore and review complaints submitted by employees. Click on a complaint to view details, track progress, and manage resolutions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-semibold text-gray-700">Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  
    );
}

export default ComplaintsList