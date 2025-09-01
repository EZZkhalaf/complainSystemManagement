import React from "react";

const SelectInput = ({ list, onChange, value, leaveStatus = false }) => {
  return (
    <select
      className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={onChange}
    >
      {list.map((l, index) => (
        <option
          key={index}
          value={l.includes("All") ? "" : l.toLowerCase().replace(/ /g, "-")}
        >
          {l}
        </option>
      ))}
    </select>
  );
};

export default SelectInput;
