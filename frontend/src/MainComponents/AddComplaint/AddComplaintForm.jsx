import React, { useState } from "react";
import SelectInput from "../../Atoms/SelectInput";
import SubmitButton from "../../Atoms/SubmitButton";
import { AddComplaintHook } from "../../utils/ComplaintsHelper";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/authContext";

const AddComplaintForm = ({ setLoading }) => {
  const { user } = useAuthContext();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await AddComplaintHook(user._id, description, type, navigate);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-2xl p-6 space-y-6 border max-w-3xl"
    >
      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
          placeholder="Describe your issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <label htmlFor="type" className="block font-medium text-gray-700 mb-1">
        Type of Complaint
      </label>

      <SelectInput
        list={["General", "Technical", "Billing", "Other"]}
        onChange={(e) => setType(e.target.value)}
        value={type}
        width={"w-full"}
      />

      <SubmitButton text={"Submit Complaint"} type={"submit"} />
    </form>
  );
};

export default AddComplaintForm;
