import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupInfoHook } from '../../utils/GroupsHelper';

const AdminGroupInfo = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true); // start as true
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const data = await getGroupInfoHook(id);
      if (data) {
        setGroup(data);
      } else {
        setError("Group not found or error occurred.");
      }
    } catch (err) {
      setError("Something went wrong while fetching the group.");
    } finally {
      setLoading(false);
    }
  };
  console.log(group)

  useEffect(() => {
    fetchGroup();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!group) return null; // prevent crashing while waiting for data

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">{group.group.name}</h1>
        <p className="text-gray-500 text-sm">Created at: {new Date(group.group.createdAt).toLocaleDateString()}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-700">Group Users</h2>

      {group.users?.length === 0 ? (
        <p className="text-gray-500">No users in this group.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {group.group.users?.map(user => (
            <div key={user._id} className="bg-gray-50 border rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          ))}
          {group.group.users.length === 0 && (
            <div className="text-gray-500 italic">
                No users yet in this group.
            </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AdminGroupInfo;
