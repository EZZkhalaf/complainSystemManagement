const FeatureCard = ({ title, description }) => (
  <div className="p-6 border rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-300">
    <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default FeatureCard;
