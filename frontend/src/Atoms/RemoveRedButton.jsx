import React from "react";

const RemoveRedButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-red-400 font-bold  px-2 text-white rounded-lg hover:bg-red-400 shadow-sm transition duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-red-300"
      title="Delete Permission"
    >
      X
    </button>
  );
};

export default RemoveRedButton;
