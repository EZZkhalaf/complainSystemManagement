import React from "react";
import { useAuthContext } from "../../Context/authContext";

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};
const ComplaintStatus = ({ complaint, id, setLoading, navigate }) => {
  const { user } = useAuthContext();

  const changeComaplaintStatus = async (Decision) => {
    setLoading(true);
    let complaintId = id;
    let userId = user._id;
    const data = await handleComplaintInGroupHook(
      complaintId,
      userId,
      Decision
    );
    if (data.success) {
      setLoading(false);
      navigate(-1);
    }
    if (data.success) {
      navigate(
        `/${
          user.role === "admin" ? "adminPage" : "userPage"
        }/groupsForComplaints`
      );
    }
  };
  return (
    <div>
      <p className="text-gray-600 font-medium mb-2">
        Status: {complaint.complaint_status}
      </p>
      {complaint?.complaint_status === "pending" ||
      complaint?.complaint_status === "in-progress" ? (
        <div>
          {complaint.complaint_status === "pending" ||
          complaint.complaint_status === "in-progress" ? (
            <div className="flex  sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => changeComaplaintStatus("accept")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              >
                Accept
              </button>

              <button
                onClick={() => changeComaplaintStatus("reject")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                Reject
              </button>
            </div>
          ) : (
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                complaint.complaint_status
              )}`}
            >
              {complaint.complaint_status}
            </span>
          )}
        </div>
      ) : (
        <span
          className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
            complaint.complaint_status
          )}`}
        >
          {complaint.complaint_status}
        </span>
      )}
    </div>
  );
};

export default ComplaintStatus;
