import {
  changeComplaintStatusHook,
  deleteComplaintHook,
  getComaplintInfoHook,
} from "../../utils/ComplaintsHelper";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";
import { useState, useEffect } from "react";
import { hasPermission } from "../../utils/AuthHooks";
import TextLabel from "../../Atoms/TextLabel";
import PageHeader from "../../Molecules/PageHeader";
import SubmitButton from "../../Atoms/SubmitButton";

const UserComplaintInfo = () => {
  const [complaint, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const response = await getComaplintInfoHook(id);
      console.log(response);
      setComplaints(response);
      setNewStatus(response.status);
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

  if (loading)
    return <div className="text-center mt-10">Loading complaints...</div>;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 p-1 rounded-lg";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800 p-1 rounded-lg";
      case "rejected":
        return "bg-red-100 text-red-800 p-1 rounded-lg";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        header={"Complaint Details"}
        paragraph={
          "view the complaint and its details , and view the user info by clicking on the user name"
        }
      />
      <div className="flex justify-between items-center mb-6">
        <SubmitButton
          text={"Back to Complaints"}
          type={""}
          onClick={() => navigate(`/userPage/list-complaints/${user._id}`)}
          submitButtonCss={
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 hover:text-blue-900 transition"
          }
        />

        <SubmitButton
          text={"Delete Complaint"}
          type={""}
          onClick={handleDeleteComplaint}
          submitButtonCss={
            "px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          }
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <TextLabel
          title={"User"}
          desc={complaint.creator_user?.user_name || "Unknown"}
        />

        <TextLabel title={"Type"} desc={complaint.complaint_type} />

        <TextLabel title={"Description"} desc={complaint.description} />

        <TextLabel
          title={"Status"}
          desc={complaint.complaint_status}
          css={getStatusStyle(complaint.complaint_status)}
        />
      </div>
    </div>
  );
};

export default UserComplaintInfo;
