import React from "react";

const SelectButton = ({ onClick, selected, item_id }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md font-medium shadow-sm transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
        selected.includes(item_id)
          ? "bg-indigo-400 text-white hover:bg-indigo-700"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
    >
      {selected.includes(item_id) ? "Selected" : "Select"}
    </button>
  );
};

export default SelectButton;
