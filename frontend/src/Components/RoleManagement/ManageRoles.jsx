import React, { useEffect, useState } from 'react';
import RoleComponent from './RoleComponent';
import AssignUsersToRole from './AssignUsersToRole';
import { useNavigate } from 'react-router-dom';
import { addnewRoleHook, fetchRolesHook } from '../../utils/RolesHelper';

const ManageRoles = () => {
  const [adding, setAdding] = useState(false);
  const [newRole, setNewRoleName] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingEmployee, setAddEmployee] = useState(false);
  const [selectedRoleToAddEmployee, setSelectedRoleToAddEmployee] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    const data = await addnewRoleHook(newRole);
    setRoles([...roles, data]);
    setNewRoleName('');
    setAdding(false);
  };

  const fetchRoles = async () => {
    setLoading(true);
    const data = await fetchRolesHook();

    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header and description */}
      <div className='flex justify-between'>

      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Roles</h1>
        <p className="text-gray-600 max-w-xl">
          Create, edit, and assign roles to employees to manage permissions efficiently.
        </p>
      </div>

      {/* Add Role Section */}
      <div className="flex justify-between items-center">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="bg-blue-500 px-4 py-2 rounded-bl-xl rounded-tl-2xl hover:bg-blue-600 transition"
          >
            <p className="text-white font-bold">Add New Role</p>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              required
              autoFocus
              className="px-3 py-2 border rounded-md w-48"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewRoleName('');
              }}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </form>
        )}
      </div>


      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading roles...
        </div>
      )}

      {/* Roles List or Placeholder */}
      {!loading && roles.length === 0 && (
        <div className="text-center py-20 text-gray-400 italic">
          No roles found yet. Start by adding a new role above.
        </div>
      )}

      {!loading && roles.length > 0 && (
        <RoleComponent
          roles={roles}
          setAddEmployee={setAddEmployee}
          setRoles={setRoles}
          setSelectedRoleToAddEmployee={setSelectedRoleToAddEmployee}
        />
      )}

      {/* Assign Users Modal / Drawer */}
      {addingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
            <button
              className="text-gray-500 hover:text-gray-700 float-right"
              onClick={() => setAddEmployee(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <AssignUsersToRole
              role={selectedRoleToAddEmployee}
              onClose={() => setAddEmployee(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
