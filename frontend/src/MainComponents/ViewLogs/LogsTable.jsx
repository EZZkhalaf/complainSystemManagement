import React from "react";
import TableHeaders from "../../Molecules/TableHeaders";

const LogsTable = ({ logs, currentPage, LOGS_PER_PAGE }) => {
  const headers = ["#", "User", "Action", "Resource", "Message", " Timestamp"];

  return (
    <div className="overflow-x-auto shadow rounded-lg bg-white">
      <table className="w-full text-sm text-left text-gray-700">
        <TableHeaders headers={headers} />
        <tbody>
          {logs.map((log, index) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 border-b">
                {(currentPage - 1) * LOGS_PER_PAGE + index + 1}
              </td>
              <td className="px-6 py-4 border-b">
                {log?.user?.user_name || "Unknown"}
              </td>
              <td className="px-6 py-4 border-b text-blue-600 font-medium">
                {log?.action}
              </td>
              <td className="px-6 py-4 border-b">{log?.resource}</td>
              <td className="px-6 py-4 border-b">{log?.message}</td>
              <td className="px-6 py-4 border-b text-gray-500">
                {new Date(log?.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
