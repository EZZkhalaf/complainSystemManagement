import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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

export default ComplaintsBarChart;
