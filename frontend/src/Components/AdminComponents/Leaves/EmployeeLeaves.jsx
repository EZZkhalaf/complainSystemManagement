import React, { useEffect, useState } from "react";
import {
  changeLeaveStatus,
  getLeaves,
  getUserLeaves,
} from "../../../utils/LeavesHelper";
import { useNavigate } from "react-router-dom";
import LeaveComponent from "../../../Molecules/LeaveComponent";
import { toast } from "react-toastify";
import PagingButtons from "../../../Molecules/PagingButtons";
import TableHeaders from "../../../Molecules/TableHeaders";
import LeaveTableFilteringButtons from "../../../Molecules/LeaveTableFilteringButtons";
import FailedMessage from "../../../Atoms/FailedMessage";

const EmployeeLeaves = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const leavesPerPage = 8;
  const [totalLeaves, setTotalLeaves] = useState(0);

  const [leave_type, setLeaveType] = useState("");
  const [leave_status, setLeaveStatus] = useState("");
  const leavesTypes = ["general", "sick", "personal"];
  const leavesStatus = ["accepted", "rejected", "pending"];
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const indexOfLastLeave = currentPage * leavesPerPage;
  const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;

  const totalPages = Math.ceil(totalLeaves / leavesPerPage);

  const fetchLeaves = async () => {
    const response = await getLeaves(
      user.user_id || user._id,
      currentPage,
      leavesPerPage,
      leave_type || undefined,
      leave_status || undefined,
      dateFrom || undefined,
      dateTo || undefined
    );
    if (response.leaves) {
      setLeaves(response.leaves);
      setCurrentPage(response.currentPage);
      setTotalLeaves(response.totalLeaves);
    } else {
      toast.error(response.error);
    }
  };
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, leave_type, leave_status, dateFrom, dateTo]);

  useEffect(() => {
    if (user?.user_id) {
      fetchLeaves();
    }
  }, [user]);

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
          {leaves.length > 0 ? (
            <tbody>
              {leaves.map((leave, idx) => (
                <LeaveComponent leave={leave} idx={idx} user={user} />
              ))}
            </tbody>
          ) : (
            <FailedMessage message={"No Leaves For This Month"} />
          )}
        </table>
      </div>
      {leaves.length >= 10 && (
        <PagingButtons
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default EmployeeLeaves;
