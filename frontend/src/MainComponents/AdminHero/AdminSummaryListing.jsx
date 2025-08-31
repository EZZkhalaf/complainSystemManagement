import SummaryWithFeature from "../../Molecules/SummaryWithFeature";

const AdminSummaryListing = ({ fields }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-6">
      {fields.map((f, index) => (
        <SummaryWithFeature
          key={index}
          label={f.label}
          value={f.value}
          color="text-blue-600"
          title={f.title}
          desc={f.desc}
        />
      ))}
    </div>
  );
};

export default AdminSummaryListing;
