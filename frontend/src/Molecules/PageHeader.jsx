import React from "react";

const PageHeader = ({ header, paragraph }) => {
  return (
    <div className="mb-10 border-b pb-4">
      <h1 className="text-3xl font-semibold text-gray-800">{header}</h1>
      <p className="text-gray-500 text-sm mt-1">{paragraph}</p>
    </div>
  );
};

export default PageHeader;
