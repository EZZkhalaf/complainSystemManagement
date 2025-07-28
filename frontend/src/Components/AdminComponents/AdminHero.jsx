import React, { useEffect, useState } from 'react';
import { fetchAdminSummaryHook } from '../../utils/UserHelper';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../Context/authContext';

const AdminHero = () => {
  const { user } = useAuthContext();

  const [complaintCount, setComplaintCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);

  const fetchSummary = async () => {
    try {
      const data = await fetchAdminSummaryHook(user._id);
      console.log(data);
      setComplaintCount(data.complaints);
      setUserCount(data.users);
      setGroupsCount(data.groups);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };
  useEffect(() => {

    
      fetchSummary();
    
  }, [user]);

  return (
    <div className="w-full px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, Admin!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of the system status.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Complaints</h2>
            <p className="text-3xl font-bold text-blue-600">{complaintCount}</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-green-600">{userCount}</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Groups</h2>
            <p className="text-3xl font-bold text-green-600">{groupsCount}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHero;
