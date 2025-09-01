import React from "react";
import LeavesTable from "./LeavesTable";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../Molecules/PageHeader";

const LeavesHomePageAdmin = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <PageHeader
          header={"View Leaves"}
          paragraph={`View all The leave requests, track their status, and accept or reject them `}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <LeavesTable />
      </div>
    </div>
  );
};

export default LeavesHomePageAdmin;
