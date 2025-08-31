import React from "react";
import { useAuthContext } from "../../Context/authContext";

const FilteringButtons = ({
  setUser,
  debouncedUserFetch,
  setCurrentPage,
  handleFilterChange,
  setAction,
  setResource,
  action,
  resource,
  user,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by user..."
        value={user}
        onChange={(e) => {
          e.preventDefault();
          setUser(e.target.value);
          setCurrentPage(1);
          debouncedUserFetch(e.target.value);
        }}
        className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />

      <select
        value={action}
        onChange={(e) => {
          e.preventDefault();
          setAction(e.target.value);
          handleFilterChange();
        }}
        className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">All Actions</option>
        <option value="Login">Login</option>
        <option value="Add-Permission">Add-Permission</option>
        <option value="Delete-Role">Delete-Role</option>
        <option value="Delete-Group">Delete-Group</option>
        <option value="Add-User">Add-User</option>
        <option value="Edit-Rule">Edit-Rule</option>
        <option value="Leave-Action">Leave-Action</option>
      </select>

      <select
        value={resource}
        onChange={(e) => {
          setResource(e.target.value);
          handleFilterChange();
        }}
        className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">All Resources</option>
        <option value="User">User</option>
        <option value="Permission">Permission</option>
        <option value="Role">Role</option>
        <option value="Group">Group</option>
        <option value="Complaint">Complaint</option>
      </select>
    </div>
  );
};

export default FilteringButtons;
