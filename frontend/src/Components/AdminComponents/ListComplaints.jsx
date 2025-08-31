import React, { useEffect, useState } from "react";
import { listComplaintsHook } from "../../utils/ComplaintsHelper";
import { useAuthContext } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import PageHeader from "../../Molecules/PageHeader";
import ComplaintsListing from "../../MainComponents/AdminListComplaints/ComplaintsListing";
import PagingButtons from "../../Molecules/PagingButtons";

const ListComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await listComplaintsHook(user._id, currentPage, 9);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setComplaints(data.complaints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentPage]);

  const filteredComplaints = complaints
    .filter((comp) => comp.creator_user.user_id !== user.user_id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <div className="max-w-md min-h-full mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        header={"All Complaints"}
        paragraph={
          "Explore and review complaints submitted by employees. Click on a complaint to view details, track progress, and manage resolutions."
        }
      />

      <ComplaintsListing filteredComplaints={filteredComplaints} />

      <PagingButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ListComplaints;
