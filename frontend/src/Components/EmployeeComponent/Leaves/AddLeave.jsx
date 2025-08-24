import React, { useState } from "react";
import { addLeave } from "../../../utils/LeavesHelper";
import { useAuthContext } from "../../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddLeave = () => {
    const {user} = useAuthContext();
    const navigate = useNavigate()
    const [leaveDescription, setLeaveDescription] = useState("");
    const [leaveType, setLeaveType] = useState("sick");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const leaveTypes = ["sick", "general", "personal"]; 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await addLeave(user._id , leaveDescription , leaveType)
        if(response.success){
            navigate(-1)
            toast.success(response.message)
        }else{
            toast.error("something went wrong please try again")
        }
        
    };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-700 text-center">
        Request a Leave
      </h2>

      {message && (
        <div className="mb-4 text-center text-sm text-red-500 font-medium">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-1 font-medium">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 mb-1 font-medium">
            Leave Description
          </label>
          <textarea
            value={leaveDescription}
            onChange={(e) => setLeaveDescription(e.target.value)}
            placeholder="Enter reason for leave"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default AddLeave;
