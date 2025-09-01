import { useState } from "react";
import { changeLeaveStatus } from "../utils/LeavesHelper";
import PageLoading from "../Atoms/PageLoading";
import SelectInput from "../Atoms/SelectInput";
import LeaveStatusSelect from "../Atoms/LeaveStatusSelect";
import { useAuthContext } from "../Context/authContext";
import { toast } from "react-toastify";
const LeaveComponent = ({ leave, idx }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const [state, setState] = useState(leave.leave_status);
  const changeStatus = async (e) => {
    setLoading(true);
    const newState = e.target.value;
    setState(newState); // update state

    const response = await changeLeaveStatus(
      leave.leave_id,
      user._id,
      newState
    );
    setLoading(false);
    if (response.success) {
      setState(response.leave.leave_status);
      toast.success(response.message);
    } else {
      toast.error(response.error);
    }
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
          <PageLoading />
        ) : (
          <LeaveStatusSelect
            state={state}
            changeStatus={changeStatus}
            leave={leave}
          />
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

export default LeaveComponent;
