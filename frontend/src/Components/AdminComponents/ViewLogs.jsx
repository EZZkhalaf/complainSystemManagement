import React, { useState, useEffect } from 'react';

const mockLogs = Array.from({ length: 20 }).map((_, i) => ({
  _id: i + 1,
  user: { name: `User ${i + 1}`, email: `user${i + 1}@test.com` },
  action: "Some_Action",
  resource: "Resource_Name",
  resourceId: "abcd1234",
  message: `This is log message number ${i + 1}`,
  timestamp: new Date().toISOString()
}));

const LOGS_PER_PAGE = 10;

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
    const paginatedLogs = mockLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
    setLogs(paginatedLogs);
  }, [currentPage]);

  const totalPages = Math.ceil(mockLogs.length / LOGS_PER_PAGE);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === 'prev' && prev > 1) return prev - 1;
      if (direction === 'next' && prev < totalPages) return prev + 1;
      return prev;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Log Viewer</h2>

      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr>
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Action</th>
            <th className="border px-4 py-2">Resource</th>
            <th className="border px-4 py-2">Message</th>
            <th className="border px-4 py-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log._id} className="text-sm">
              <td className="border px-4 py-2">{(currentPage - 1) * LOGS_PER_PAGE + index + 1}</td>
              <td className="border px-4 py-2">{log.user.name}</td>
              <td className="border px-4 py-2">{log.action}</td>
              <td className="border px-4 py-2">{log.resource}</td>
              <td className="border px-4 py-2">{log.message}</td>
              <td className="border px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewLogs;
