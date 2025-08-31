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

export default SummaryWithFeature;
