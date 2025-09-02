const SummaryCard = ({ label, count, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition duration-300">
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{label}</h3>
    <p className={`text-4xl font-bold ${color}`}>{count}</p>
  </div>
);

export default SummaryCard;
