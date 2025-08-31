import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/authContext";

const getStatusStyles = (status) => {
  const styles = {
    resolved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

const ComplaintCard = ({ complaint, group = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <div
      onClick={() => {
        const path = group
          ? `/${
              user.role === "admin" ? "adminPage" : "userPage"
            }/groupsForComplaints/complaint/${complaint.complaint_id}`
          : `/${user.role === "admin" ? "adminPage" : "userPage"}/complaint/${
              complaint.complaint_id
            }`;
        navigate(path);
      }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 capitalize">
          {complaint.complaint_type} Complaint
        </h3>
        <p className="text-sm text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyles(
            complaint.status
          )}`}
        >
          {complaint.complaint_status}
        </span>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {complaint.creator_user?.user_name}
          </p>
          <p className="text-xs text-gray-500">
            {complaint.creator_user?.user_email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
