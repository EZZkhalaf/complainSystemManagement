import React from "react";
import { hasPermission } from "../utils/AuthHooks";
import { useAuthContext } from "../Context/authContext";

const LeaveStatusSelect = ({ state, changeStatus, leave }) => {
  const { user } = useAuthContext();
  return (
    <div>
      {hasPermission(user, "handle-leaves") && state === "pending" ? (
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
  );
};

export default LeaveStatusSelect;
