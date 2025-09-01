import React, { useState } from "react";
import { AddComplaintHook } from "../../utils/ComplaintsHelper";
import { useAuthContext } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import SelectInput from "../../Atoms/SelectInput";
import SubmitButton from "../../Atoms/SubmitButton";
import PageHeader from "../../Molecules/PageHeader";

const AddComplaint = () => {
  const { user } = useAuthContext();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await AddComplaintHook(user._id, description, type, navigate);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  return (
    <div className=" mx-auto px-4 py-8">
      <PageHeader
        header={"Complaint Form"}
        paragraph={
          "Fill the Complaint Form and choose the complaint type , make sure that you explain in details what happened"
        }
      />
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
    </div>
  );
};

export default AddComplaint;
