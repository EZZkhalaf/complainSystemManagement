import React from "react";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../../utils/AuthHooks";
import { useAuthContext } from "../../Context/authContext";

const ComplaintNextBackButtons = ({ handleDeleteComplaint }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 hover:text-blue-900 transition"
      >
        Back to Complaints
      </button>

      {(hasPermission("delete_complaint") || user.role === "admin") && (
        <button
          onClick={handleDeleteComplaint}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition"
        >
          Delete Complaint
        </button>
      )}
    </div>
  );
};

export default ComplaintNextBackButtons;
