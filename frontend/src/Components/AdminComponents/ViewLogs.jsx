import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getLogsHook } from "../../utils/LogsHelper";
import { OrbitProgress } from "react-loading-indicators";
import debounce from "lodash/debounce";
import PageLoading from "../../Atoms/PageLoading";
import FilteringButtons from "../../MainComponents/ViewLogs/FilteringButtons";
import TableHeaders from "../../Molecules/TableHeaders";
import PagingButtons from "../../Molecules/PagingButtons";
const LOGS_PER_PAGE = 10;

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [user, setUser] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async ({ page, action, resource, user }) => {
    setLoading(true);
    try {
      const data = await getLogsHook(page, LOGS_PER_PAGE, {
        action,
        resource,
        user,
      });
      setLogs(data.data);
      setTotalPages(Math.ceil(data.totalPages));
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedUserFetch = useMemo(
    () =>
      debounce((nextUser) => {
        fetchLogs({ page: 1, action, resource, user: nextUser });
      }, 500),
    [action, resource, fetchLogs]
  );

  useEffect(() => {
    fetchLogs({ page: currentPage, action, resource, user });
  }, [currentPage, action, resource, fetchLogs]);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const headers = ["#", "User", "Action", "Resource", "Message", " Timestamp"];
  if (loading) return <PageLoading />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Company Logs</h2>

      <FilteringButtons
        setUser={setUser}
        debouncedUserFetch={debouncedUserFetch}
        setCurrentPage={setCurrentPage}
        handleFilterChange={handleFilterChange}
        setAction={setAction}
        setResource={setResource}
        action={action}
        resource={resource}
        user={user}
      />

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

      <PagingButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ViewLogs;
