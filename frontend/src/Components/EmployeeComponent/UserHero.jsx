import React, { useEffect, useState } from 'react';
import { fetchAdminSummaryHook } from '../../utils/UserHelper';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';

const UserHero = () => {
  const { user } = useAuthContext();
  const [complaintCount, setComplaintCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await fetchAdminSummaryHook(user._id);
        setComplaintCount(data?.complaints);
        setUserCount(data?.users);
        setGroupsCount(data?.groups);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    if (user) fetchSummary();
  }, [user]);

  return (
    <div className="w-full py-10 px-4 md:px-8 bg-gray-50 min-h-screen">
      {/* Welcome Header */}

      {hasPermission("view_dashboard_summary") && (
        <>
        <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's a quick overview of your system dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <SummaryCard label="Total Complaints" count={complaintCount} color="text-blue-600" />
        <SummaryCard label="Total Users" count={userCount} color="text-green-600" />
        <SummaryCard label="Total Groups" count={groupsCount} color="text-purple-600" />
      </div>

        </>
      )}
      {/* About Section */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Complaint Management System Overview
        </h2>
        <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
          We’re glad to have you here. This platform helps you report issues, stay updated, and connect with your team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            title="Submit a Complaint"
            description="Use the complaint form to report issues. We'll ensure they’re reviewed and addressed."
          />
          <FeatureCard
            title="Track Your Complaints"
            description="Stay updated on the status of your complaints in real time."
          />
          <FeatureCard
            title="Group Collaboration"
            description="Join groups to engage with others and improve communication."
          />
          <FeatureCard
            title="Your Information is Safe"
            description="All your data is secured and accessible only to authorized team members."
          />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, count, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition duration-300">
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{label}</h3>
    <p className={`text-4xl font-bold ${color}`}>{count}</p>
  </div>
);

const FeatureCard = ({ title, description }) => (
  <div className="p-6 border rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-300">
    <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default UserHero;
