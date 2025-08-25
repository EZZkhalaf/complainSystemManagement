import React, { useEffect, useState } from "react";
import {
  changeLeaveStatus,
  getLeaves,
  getUserLeaves,
} from "../../../utils/LeavesHelper";
import { useAuthContext } from "../../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import { toast } from "react-toastify";

const LeaveComponent = ({ leave, idx }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const [state, setState] = useState(leave.leave_status);
  // success : true,
  //         message : "leave state updated successfully",
  //         leave
  const changeStatus = async (e) => {
    setLoading(true);
    const newState = e.target.value;
    setState(newState); // update state

    const response = await changeLeaveStatus(
      leave.leave_id,
      user._id,
      newState
    );
    console.log(response);
    setLoading(false);
    setState(response.leave.leave_status);
    toast.success(response.message);
  };

  return (
    <tr
      key={leave.leave_id}
      className={`${
        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
      } hover:bg-gray-100 transition-colors`}
    >
      <td className="px-6 py-3 text-gray-700">{leave.leave_id}</td>
      <td className="px-6 py-3 text-gray-700">{leave.leave_description}</td>
      <td className="px-6 py-3 capitalize text-gray-700">{leave.leave_type}</td>
      <td className="px-6 py-3">
        {loading ? (
          <div className="inline-block transform scale-50">
            <OrbitProgress />
          </div>
        ) : (
          <div>
            {state === "pending" ? (
              <select
                className="bg-gray-300 text-black px-3 py-1 rounded text-sm font-semibold focus:outline-none"
                value={state}
                onChange={changeStatus}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accept</option>
                <option value="rejected">Reject</option>
              </select>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  leave.leave_status === "pending"
                    ? "bg-yellow-500"
                    : leave.leave_status === "accepted"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {state}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-3 text-gray-700">{leave.leave_user_name}</td>
      <td className="px-6 py-3 text-gray-700">
        {leave.leave_handler_name || "NA"}
      </td>
      <td className="px-6 py-3 text-gray-500 text-sm">
        {new Date(leave.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </td>
      <td className="px-6 py-3 text-gray-500 text-sm">
        {new Date(leave.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </td>
    </tr>
  );
};

const EmployeeLeaves = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
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

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const fetchLeaves = async () => {
    const response = await getLeaves(
      user.user_id,
      currentPage,
      leavesPerPage,
      leave_type || undefined,
      leave_status || undefined,
      dateFrom || undefined,
      dateTo || undefined
    );
    console.log(response);
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
        <div className="flex flex-wrap items-end  gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Leave Type</label>
            <select
              value={leave_type}
              onChange={(e) => setLeaveType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All</option>
              {leavesTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">
              Leave Status
            </label>
            <select
              value={leave_status}
              onChange={(e) => setLeaveStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All</option>
              {leavesStatus.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={() =>
              fetchLeaves({
                leave_type,
                leave_status,
                date_from: dateFrom,
                date_to: dateTo,
              })
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6 sm:mt-0"
          >
            Apply Filters
          </button>
        </div>

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              {[
                "ID",
                "Description",
                "Type",
                "Status",
                "User",
                "Handler",
                "Created At",
                "Updated At",
              ].map((header) => (
                <th
                  key={header}
                  className="text-left px-6 py-3 text-gray-600 font-medium uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave, idx) => (
              <LeaveComponent leave={leave} idx={idx} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-600 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeLeaves;
