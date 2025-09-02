import React from "react";

const TableHeaders = ({ headers }) => {
  return (
    <thead className="bg-gray-200">
      {headers.map((h, index) => (
        <th
          key={index}
          className="border border-gray-200 px-3 py-3 text-gray-600 text-left lg:text-lg text-sm"
        >
          {h}
        </th>
      ))}
    </thead>
  );
};

export default TableHeaders;
