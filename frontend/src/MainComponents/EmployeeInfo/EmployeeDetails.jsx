import React from "react";

const EmployeeDetails = ({
  employee,
  setEditableEmail,
  setEditableName,
  setSelectedRole,
  setNewPassword,
  roles,
  selectedRole,
  editableEmail,
  editableName,
  newPassword,
  editing,
  defaultPhoto,
}) => {
  return (
    <div className="flex  w-full">
      <div className="mr-5">
        <img
          src={
            employee?.profilePicture
              ? `http://localhost:5000${employee.profilePicture}`
              : defaultPhoto
          }
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex text-center  sm:text-left">
          {!editing ? (
            <div className="flex flex-col ">
              <h2 className="flex text-2xl  font-bold text-blue-800 capitalize">
                {employee?.user_name}
              </h2>
              <p className="text-gray-600 mt-1">{employee?.user_email}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center ">
                <p className=" text-black font-bold mr-2"> Name :</p>
                <input
                  type="text"
                  name="editableName"
                  id="editableName"
                  className="border rounded-lg  py-1 text-xl font-semibold  capitalize"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                />
              </div>

              <div className="flex items-center ">
                <p className=" text-black font-bold mr-2"> Email :</p>
                <input
                  type="email"
                  name="editableEmail"
                  id="editableEmail"
                  className="border rounded-lg  py-1 mt-1 text-xl font-semibold  capitalize"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center ">
                <p className=" text-black font-bold mr-2"> Pass :</p>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Change User Password"
                  className="border rounded-lg px-3 py-1 mt-2 text-gray-700"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center bg-gray-50  rounded-xl ">
          <div className="flex flex-col  ">
            <div className="flex  ">
              <span className=" capitalize text-xl flex flex-col  text-md ">
                <div className="flex  ">
                  {editing ? (
                    <div className="flex items-center ">
                      <p className=" text-black font-bold mr-2"> Role :</p>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="border rounded px-2 py-1 text-md"
                      >
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_name}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p>{selectedRole}</p>
                  )}
                </div>
              </span>
            </div>

            <div className="flex items-center w-full">
              <p className="text-center text-m text-gray-500">Created At :</p>
              <p className="text-gray-700 font-medium ml-2">
                {employee?.created_at?.slice(0, 10) || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
