import React from "react";
import EmpCard from "../../Molecules/EmpCard";

const ListEmployees = ({ filteredEmployees }) => {
  return (
    <div>
      {filteredEmployees && filteredEmployees.length > 0 ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredEmployees.map((emp) => (
            <EmpCard emp={emp} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 text-lg italic">No employees found.</p>
        </div>
      )}
    </div>
  );
};

export default ListEmployees;
