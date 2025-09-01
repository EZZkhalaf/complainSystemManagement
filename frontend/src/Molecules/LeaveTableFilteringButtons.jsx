import React from "react";

const LeaveTableFilteringButtons = ({
  leave_status,
  leave_type,
  setLeaveStatus,
  setLeaveType,
  setDateFrom,
  setDateTo,
  leavesStatus,
  fetchLeaves,
  leavesTypes,
  dateFrom,
  dateTo,
}) => {
  return (
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
        <label className="text-gray-700 font-medium mb-1">Leave Status</label>
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
  );
};

export default LeaveTableFilteringButtons;
