import React, { useEffect, useState } from "react";
import {
  changeComplaintStatusHook,
  deleteComplaintHook,
  getComaplintInfoHook,
  handleComplaintInGroupHook,
} from "../../utils/ComplaintsHelper";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { OrbitProgress } from "react-loading-indicators";
import { toast } from "react-toastify";
import { hasPermission } from "../../utils/AuthHooks";
import { listGroupsHook } from "../../utils/GroupsHelper";
import PageHeader from "../../Molecules/PageHeader";
import TextLabel from "../../Atoms/TextLabel";
import PageLoading from "../../Atoms/PageLoading";
import ComplaintStatus from "../../MainComponents/ComplaintInfo/ComplaintStatus";
import ComplaintNextBackButtons from "../../MainComponents/ComplaintInfo/ComplaintNextBackButtons";
const ComplaintInfo = () => {
  const [complaint, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await getComaplintInfoHook(id);
      setComplaints(response);
      setNewStatus(response.status);
      const gData = await listGroupsHook(user._id);
      setGroups(gData);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteComplaint = async () => {
    if (!window.confirm("Are you sure you want to delete this complaint?"))
      return;
    await deleteComplaintHook(complaint.complaint_id, user._id, navigate);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-gray-50 min-h-screen">
      <PageHeader
        header={"Complaint Info"}
        paragraph={
          "here you can view the complaint and its user , and the complaint status"
        }
      />
      <ComplaintNextBackButtons handleDeleteComplaint={handleDeleteComplaint} />

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-gray-600 font-medium mb-1">User:</p>
          {hasPermission(user, "view_employees") ? (
            <span
              onClick={() =>
                navigate(
                  `/${
                    user.role === "admin" ? "adminPage" : "userPage"
                  }/listEmployees/employee/${complaint?.creator_user?.user_id}`
                )
              }
              className="inline-block cursor-pointer px-3 py-1 rounded-full bg-gray-200 text-gray-900 hover:bg-gray-800 hover:text-white transition"
            >
              {complaint?.creator_user?.user_name || "Unknown"}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900">
              {complaint?.creator_user?.user_name || "Unknown"}
            </span>
          )}
        </div>

        <TextLabel title={"Type"} desc={complaint.complaint_type} />

        <TextLabel title={"Description"} desc={complaint.description} />

        <ComplaintStatus
          complaint={complaint}
          id={id}
          setLoading={setLoading}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default ComplaintInfo;
