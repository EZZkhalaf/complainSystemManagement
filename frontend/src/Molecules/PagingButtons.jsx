import React from "react";

const PagingButtons = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          className={`px-4 py-2 border rounded-lg ${
            currentPage === index + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        disabled={currentPage > totalPages - 1}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default PagingButtons;
