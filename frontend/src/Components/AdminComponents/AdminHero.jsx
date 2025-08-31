import React, { useEffect, useState } from "react";
import {
  fetchAdminSummaryHook,
  fetchSummaryChart,
} from "../../utils/UserHelper";
import { useAuthContext } from "../../Context/authContext";
import PageHeader from "../../Molecules/PageHeader";
import ComplaintsBarChart from "../../MainComponents/AdminHero/ComplaintsBarChart";
import AdminSummaryListing from "../../MainComponents/AdminHero/AdminSummaryListing";

const AdminHero = () => {
  const { user } = useAuthContext();
  const [summary, setSummary] = useState({
    complaints: 0,
    users: 0,
    groups: 0,
  });

  const [complaintsSumm, setComplaintsSumm] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await fetchAdminSummaryHook(user._id);
        setSummary(data);

        const dataChart = await fetchSummaryChart(user._id);
        setComplaintsSumm(dataChart);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    if (user) fetchSummary();
  }, [user]);

  const summaryFields = [
    {
      label: "Complaints",
      value: summary.complaints,
      color: "text-blue-600",
      title: "📬 Manage Complaints",
      desc: "Review, assign, or delete complaints based on your role.",
    },
    {
      label: "Users",
      value: summary.users,
      color: "text-green-600",
      title: "👥 Handle Users",
      desc: "View user accounts and assign them to roles or groups.",
    },
    {
      label: "Groups",
      value: summary.groups,
      color: "text-indigo-600",
      title: "🧩 Organize Groups",
      desc: "Create and manage user groups for task distribution.",
    },
    {
      label: "Security",
      value: "✔",
      color: "text-red-500",
      title: "🔐 Secure Access",
      desc: "Only admins and authorized users can make changes.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white px-6 py-10">
      <PageHeader
        header={`Welcome, ${user?.name} 👋`}
        paragraph={
          "Here's an overview of today's stats and actions you can take."
        }
      />

      <ComplaintsBarChart data={complaintsSumm} />
      <AdminSummaryListing fields={summaryFields} />
    </div>
  );
};

export default AdminHero;
