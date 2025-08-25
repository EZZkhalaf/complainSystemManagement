import React, { useEffect, useState } from "react";
import { fetchSummaryChartLeaves } from "../../../utils/UserHelper";
import { useScroll } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const EmpoyeeLeavesChartSummary = ({ user }) => {
  const [summary, setSummary] = useState({});
  const [complaintsSumm, setComplaintsSumm] = useState(null);
  const fetchCharts = async () => {
    const response = await fetchSummaryChartLeaves(user?.user_id);
    setSummary(response);
  };
  useEffect(() => {
    if (user) fetchCharts();
  }, []);

  return (
    <div className=" bg-white ">
      <h1 className="text-black font-bold">Leaves Summary</h1>
      <LeavesBarChart data={summary} />
    </div>
  );
};

const LeavesBarChart = ({ data }) => {
  if (!data) return <p>No chart data</p>;

  const chartData = [
    { category: "Total", total: data.totalLeaves || 0 },
    { category: "Accepted", total: data.acceptedLeaves || 0 },
    { category: "Rejected", total: data.rejectedLeaves || 0 },
    { category: "Pending", total: data.pendingLeaves || 0 },
    { category: "Handled", total: data.handeledLeaves || 0 },
  ];

  return (
    <div className="w-200 h-64">
      <ResponsiveContainer width="70%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 20, bottom: 5 }}
        >
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

export default EmpoyeeLeavesChartSummary;
