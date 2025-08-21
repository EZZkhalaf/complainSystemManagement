import React, { useEffect, useState } from 'react';
import { fetchAdminSummaryHook, fetchSummaryChart } from '../../utils/UserHelper';
import { useAuthContext } from '../../Context/authContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminHero = () => {
  const { user } = useAuthContext();
  const [summary, setSummary] = useState({
    complaints: 0,
    users: 0,
    groups: 0,
  });

  const [complaintsSumm , setComplaintsSumm] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await fetchAdminSummaryHook(user._id);
        setSummary(data);

        const dataChart = await fetchSummaryChart(user._id)
        console.log(dataChart)
        setComplaintsSumm(dataChart)
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    if (user) fetchSummary();
  }, [user]);

  return (
    <div className="w-full min-h-screen bg-white px-6 py-10">
      {/* Heading */}
      <div className="mb-10 border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's an overview of today's stats and actions you can take.
        </p>
      </div>

      <ComplaintsBarChart data = {complaintsSumm}/>
      {/* Summary + Features Pair Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-6">
        <SummaryWithFeature
          label="Complaints"
          value={summary.complaints}
          color="text-blue-600"
          title="📬 Manage Complaints"
          desc="Review, assign, or delete complaints based on your role."
        />
        <SummaryWithFeature
          label="Users"
          value={summary.users}
          color="text-green-600"
          title="👥 Handle Users"
          desc="View user accounts and assign them to roles or groups."
        />
        <SummaryWithFeature
          label="Groups"
          value={summary.groups}
          color="text-indigo-600"
          title="🧩 Organize Groups"
          desc="Create and manage user groups for task distribution."
        />
        <SummaryWithFeature
          label="Security"
          value="✔"
          color="text-red-500"
          title="🔐 Secure Access"
          desc="Only admins and authorized users can make changes."
        />
      </div>
    </div>
  );
};



const ComplaintsBarChart = ({ data }) => {
  if (!data) return <p>No chart data</p>;

  // Map your backend data to the format Recharts expects
  const chartData = data.complaintsPerCategory.map((c) => ({
    category: c.complaint_type,
    total: Number(c.total),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#1D4ED8" />
        </BarChart>
        
      </ResponsiveContainer>
    </div>
  );
};

const SummaryWithFeature = ({ label, value, color, title, desc }) => (
  <div className="flex items-start gap-6 p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
    {/* Stat Box */}
    <div className="min-w-[100px] text-left">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
    </div>
    {/* Feature Info */}
    <div className="flex-1">
      <h4 className="text-md font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
  </div>
);

export default AdminHero;
