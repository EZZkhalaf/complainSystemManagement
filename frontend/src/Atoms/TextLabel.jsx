import React from "react";

const TextLabel = ({ title, desc, css }) => {
  return (
    <div>
      <p className="text-gray-600 font-medium mb-1">{title}:</p>
      <span className={`capitalize text-gray-800 ${css}`}>{desc}</span>
    </div>
  );
};

export default TextLabel;
