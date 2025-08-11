
import React, { useEffect, useState } from 'react';
import { listGroupComplaintsHook } from '../../utils/GroupsHelper';
import { useAuthContext } from '../../Context/authContext';
import { useNavigate, useParams } from 'react-router-dom';

const getStatusStyles = (status) => {
  const styles = {
    resolved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <div
      onClick={() => {
        const path = user.role === 'admin'
          ? `/adminPage/groupsForComplaints/complaint/${complaint._id}`
          : `/userPage/groupsForComplaints/complaint/${complaint._id}`;
        navigate(path);
      }}
      className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all duration-200 flex flex-col justify-between border border-gray-100"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 capitalize">
          {complaint.type} Complaint
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>
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
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuthContext();
  const { id } = useParams(); // groupId

  const fetchComplaints = async () => {
    try {
      const data = await listGroupComplaintsHook(id, user._id, {
        type: typeFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setComplaints(data.complaints);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [typeFilter, statusFilter, page]);

  const filtered = complaints
    .filter((comp) => comp.userId._id !== user._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 ">
        <h1 className=" text-3xl font-bold text-black mb-3">Group Complaints</h1>
        <p className="  text-gray-500 max-w-2xl ">
          View and track complaints submitted by group members. You can filter by type or status to focus on what matters most.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-row sm:flex-row sm:items-center gap-4 justify-center">
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Complaint Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-12 flex justify-center items-center gap-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg disabled:opacity-50 transition"
        >
          ← Previous
        </button>

        <span className="text-gray-700 font-medium">
          Page <span className="text-blue-600">{page}</span> of{' '}
          <span className="text-blue-600">{totalPages}</span>
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg disabled:opacity-50 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ComplaintsList;
