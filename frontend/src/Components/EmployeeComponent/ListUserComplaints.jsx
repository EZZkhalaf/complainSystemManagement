import React, { useEffect, useState } from "react";
import {
  listComplaintsHook,
  ListUserComplaintsHook,
} from "../../utils/ComplaintsHelper";
import { useAuthContext } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import PageHeader from "../../Molecules/PageHeader";
import ComplaintsListing from "../../MainComponents/ComplaintsList.jsx/ComplaintsListing";

const getStatusStyles = (status) => {
  const styles = {
    resolved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/userPage/complaint/${complaint.complaint_id}`)}
      className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition duration-200 flex flex-col justify-between"
    >
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
          {complaint.type} Complaint
        </h3>
        <p className="text-gray-600">{complaint.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyles(
            complaint.complaint_status
          )}`}
        >
          {complaint.complaint_status}
        </span>
        <div className="text-sm text-gray-500 text-right">
          <p className="font-medium">{complaint.creator_user?.user_name}</p>
          <p className="text-xs">{complaint.creator_user?.user_email}</p>
        </div>
      </div>
    </div>
  );
};

const ListUserComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await ListUserComplaintsHook(user._id);
      console.log(data);
      setComplaints(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);
  if (loading)
    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <PageHeader
        header={"Your Complaints"}
        paragraph={`view your latest dubmitted complaints and view their status and updates`}
      />

      <ComplaintsListing filtered={complaints} />
    </div>
  );
};

export default ListUserComplaints;
