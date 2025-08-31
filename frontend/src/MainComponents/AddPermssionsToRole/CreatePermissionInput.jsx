import React from "react";

const CreatePermissionInput = ({
  setNewPermission,
  isAdding,
  setIsAdding,
  addNewPermission,
  newPermission,
}) => {
  return (
    <div>
      {isAdding ? (
        <div className="w-full md:w-auto bg-white p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-medium mb-3 text-gray-700">
            Add New Permission
          </h3>
          <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-stretch md:items-end">
            <input
              type="text"
              value={newPermission.name}
              onChange={(e) =>
                setNewPermission({ ...newPermission, name: e.target.value })
              }
              placeholder="Permission Name (e.g., edit_complaint)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400 transition"
            />

            <input
              type="text"
              value={newPermission.description}
              onChange={(e) =>
                setNewPermission({
                  ...newPermission,
                  description: e.target.value,
                })
              }
              placeholder="Permission Description"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400 transition"
            />
            <button
              onClick={() => addNewPermission()}
              className="bg-indigo-400 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400 transition duration-300 ease-in-out focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-400 text-white font-semibold px-5 py-2 rounded-md shadow-sm hover:bg-indigo-500 transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        >
          Add New Permission
        </button>
      )}
    </div>
  );
};

export default CreatePermissionInput;
