import React, { useEffect, useState } from "react";
import { hasPermission } from "../../utils/AuthHooks";
import SummaryCard from "../../Molecules/SummaryCard";
import { useAuthContext } from "../../Context/authContext";
import { fetchAdminSummaryHook } from "../../utils/UserHelper";

const HeroSummaryCards = () => {
  const { user } = useAuthContext();
  const [complaintCount, setComplaintCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await fetchAdminSummaryHook(user._id);
        setComplaintCount(data?.complaints);
        setUserCount(data?.users);
        setGroupsCount(data?.groups);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    if (user) fetchSummary();
  }, [user]);
  return (
    <div>
      {hasPermission(user, "view_dashboard_summary") && (
        <>
          {/* Stats Cards */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <SummaryCard
              label="Total Complaints"
              count={complaintCount}
              color="text-blue-600"
            />
            <SummaryCard
              label="Total Users"
              count={userCount}
              color="text-green-600"
            />
            <SummaryCard
              label="Total Groups"
              count={groupsCount}
              color="text-purple-600"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSummaryCards;
