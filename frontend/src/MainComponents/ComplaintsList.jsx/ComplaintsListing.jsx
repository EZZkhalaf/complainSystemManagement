import FailedMessage from "../../Atoms/FailedMessage";
import ComplaintCard from "../../Molecules/ComplaintCard";

const ComplaintsListing = ({ filtered, group }) => {
  return (
    <div>
      {filtered.length === 0 ? (
        <FailedMessage message={"no Complaints Found :("} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((complaint) => (
            <ComplaintCard
              key={complaint.complaint_id}
              complaint={complaint}
              group={group}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintsListing;
