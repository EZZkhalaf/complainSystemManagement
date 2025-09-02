import React, { useState } from "react";
import { AddComplaintHook } from "../../utils/ComplaintsHelper";
import { useAuthContext } from "../../Context/authContext";
import { useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import SelectInput from "../../Atoms/SelectInput";
import SubmitButton from "../../Atoms/SubmitButton";
import PageHeader from "../../Molecules/PageHeader";
import PageLoading from "../../Atoms/PageLoading";
import AddComplaintForm from "../../MainComponents/AddComplaint/AddComplaintForm";

const AddComplaint = () => {
  const [loading, setLoading] = useState(false);

  if (loading) return <PageLoading />;
  return (
    <div className=" mx-auto px-4 py-8">
      <PageHeader
        header={"Complaint Form"}
        paragraph={
          "Fill the Complaint Form and choose the complaint type , make sure that you explain in details what happened"
        }
      />
      <AddComplaintForm setLoading={setLoading} />
    </div>
  );
};

export default AddComplaint;
