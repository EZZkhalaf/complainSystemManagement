import React from "react";

const PagingButtons = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter(
          (page) =>
            page === 1 || // always show first
            page === totalPages || // always show last
            Math.abs(page - currentPage) <= 2 // show window around current
        )
        .map((page, i, arr) => {
          const prevPage = arr[i - 1];
          const showDots = prevPage && page - prevPage > 1;

          return (
            <React.Fragment key={page}>
              {showDots && <span className="px-2">...</span>}
              <button
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default PagingButtons;
