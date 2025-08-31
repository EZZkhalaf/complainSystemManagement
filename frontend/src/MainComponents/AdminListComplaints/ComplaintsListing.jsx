import React from "react";
import ComplaintCard from "../../Molecules/ComplaintCard";

const ComplaintsListing = ({ filteredComplaints }) => {
  return (
    <div>
      {filteredComplaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.complaint_id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintsListing;
