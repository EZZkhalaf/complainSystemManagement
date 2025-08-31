import React, { useEffect, useState } from "react";
import { listGroupComplaintsHook } from "../../utils/GroupsHelper";
import { useAuthContext } from "../../Context/authContext";
import { useNavigate, useParams } from "react-router-dom";
import ComplaintCard from "../../Molecules/ComplaintCard";
import PageHeader from "../../Molecules/PageHeader";
import SelectInput from "../../Atoms/SelectInput";
import ComplaintsListing from "../../MainComponents/ComplaintsList.jsx/ComplaintsListing";
import PagingButtons from "../../Molecules/PagingButtons";

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuthContext();
  const { id } = useParams(); // groupId

  const fetchComplaints = async () => {
    try {
      const data = await listGroupComplaintsHook(id, user._id, {
        type: typeFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setComplaints(data.complaints);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [typeFilter, statusFilter, page]);

  const filtered = complaints
    .filter((comp) => comp?.creator_user?.user_id !== user._id)
    .sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        header={"Group Complaints"}
        paragraph={`View and track complaints submitted by group members. You can filter
          by type or status to focus on what matters most.`}
      />

      {/* Filters */}
      <div className="mb-8 flex flex-row sm:flex-row sm:items-center gap-4 justify-center">
        <SelectInput
          list={["All Types", "General", "Technical", "Billing", "Other"]}
          onChange={(e) => setTypeFilter(e.target.value)}
          value={typeFilter}
        />

        <SelectInput
          list={[
            "All Statuses",
            "Pending",
            "In Progress",
            "Resolved",
            "Rejected",
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <ComplaintsListing filtered={filtered} />

      <PagingButtons
        currentPage={page}
        setCurrentPage={setPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ComplaintsList;
