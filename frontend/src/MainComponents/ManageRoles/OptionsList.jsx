import React from "react";
import AssignUsersToRole from "../../Components/RoleManagement/AssignUsersToRole";

const OptionsList = ({ setAddEmployee, selectedRoleToAddEmployee }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <button
          className="text-gray-500 hover:text-gray-700 float-right"
          onClick={() => setAddEmployee(false)}
          aria-label="Close modal"
        >
          &times;
        </button>
        <AssignUsersToRole
          role={selectedRoleToAddEmployee}
          onClose={() => setAddEmployee(false)}
        />
      </div>
    </div>
  );
};

export default OptionsList;
