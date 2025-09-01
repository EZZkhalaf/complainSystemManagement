import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getLogsHook } from "../../utils/LogsHelper";
import { OrbitProgress } from "react-loading-indicators";
import debounce from "lodash/debounce";
import PageLoading from "../../Atoms/PageLoading";
import FilteringButtons from "../../MainComponents/ViewLogs/FilteringButtons";
import TableHeaders from "../../Molecules/TableHeaders";
import PagingButtons from "../../Molecules/PagingButtons";
import LogsTable from "../../MainComponents/ViewLogs/LogsTable";
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

      <LogsTable
        logs={logs}
        currentPage={currentPage}
        LOGS_PER_PAGE={LOGS_PER_PAGE}
      />

      <PagingButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ViewLogs;
