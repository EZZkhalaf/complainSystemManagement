import React from "react";
import { hasPermission } from "../utils/AuthHooks";
import { useAuthContext } from "../Context/authContext";

const EmployeePageEditButton = ({
  selectedRole,
  setEditing,
  handleSaveChanges,
  editing,
}) => {
  const { user } = useAuthContext();
  return (
    <div className="flex justify-end mb-4">
      {hasPermission(user, "edit_employee") && selectedRole !== "admin" && (
        <div>
          {/* {user.permissions.editUsers && ( */}
          <button
            onClick={() => setEditing((prev) => !prev)}
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition mr-4"
          >
            {editing ? "Cancel Edit" : "Edit"}
          </button>
          {/* )} */}
        </div>
      )}

      {editing && (
        <button
          onClick={handleSaveChanges}
          className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition "
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default EmployeePageEditButton;
