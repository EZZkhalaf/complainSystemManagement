import React, { useEffect, useState } from "react";
import {
  changeLeaveStatus,
  getLeaves,
  getUserLeaves,
} from "../../../utils/LeavesHelper";
import { useAuthContext } from "../../../Context/authContext";
import { useNavigate } from "react-router-dom";
import PagingButtons from "../../../Molecules/PagingButtons";
import TableHeaders from "../../../Molecules/TableHeaders";
import LeaveComponent from "../../../Molecules/LeaveComponent";
import LeaveTableFilteringButtons from "../../../Molecules/LeaveTableFilteringButtons";

const LeavesTable = () => {
  const [leaves, setLeaves] = useState([]);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const leavesPerPage = 8;
  const [totalLeaves, setTotalLeaves] = useState(0);

  // filters
  const [leave_type, setLeaveType] = useState("");
  const [leave_status, setLeaveStatus] = useState("");
  const leavesTypes = ["general", "sick", "personal"];
  const leavesStatus = ["accepted", "rejected", "pending"];
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const indexOfLastLeave = currentPage * leavesPerPage;
  const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;
  const currentLeaves = leaves.slice(indexOfFirstLeave, indexOfLastLeave);

  const totalPages = Math.ceil(totalLeaves / leavesPerPage);

  const fetchLeaves = async () => {
    const response = await getLeaves(
      user._id,
      currentPage,
      leavesPerPage,
      leave_type || undefined,
      leave_status || undefined,
      dateFrom || undefined,
      dateTo || undefined
    );

    setLeaves(response.leaves);
    setCurrentPage(response.currentPage);
    setTotalLeaves(response.totalLeaves);
  };
  useEffect(() => {
    fetchLeaves();
  }, [currentPage]);
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <LeaveTableFilteringButtons
          leave_status={leave_status}
          leave_type={leave_type}
          leavesStatus={leavesStatus}
          leavesTypes={leavesTypes}
          fetchLeaves={fetchLeaves}
          setLeaveStatus={setLeaveStatus}
          setLeaveType={setLeaveType}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <TableHeaders
            headers={[
              "ID",
              "Description",
              "Type",
              "Status",
              "User",
              "Handler",
              "Created At",
              "Updated At",
            ]}
          />
          <tbody>
            {leaves.map((leave, idx) => (
              <LeaveComponent leave={leave} idx={idx} />
            ))}
          </tbody>
        </table>
      </div>

      <PagingButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default LeavesTable;
