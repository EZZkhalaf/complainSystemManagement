import React from "react";

const FailedMessage = ({ message }) => {
  return (
    <div className="text-center py-20 text-gray-400 italic">{message}</div>
  );
};

export default FailedMessage;
