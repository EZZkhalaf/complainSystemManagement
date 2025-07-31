import React ,{useState}from 'react'

const AddPermissionsToRole = () => {
    const [selected, setSelected] = useState([]);

  const permissions = [
    { id: 'p1', name: 'View Users' },
    { id: 'p2', name: 'Edit Users' },
    { id: 'p3', name: 'Delete Users' },
    { id: 'p4', name: 'Manage Roles' },
    { id: 'p5', name: 'View Complaints' },
  ];

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    console.log('Selected permissions:', selected);
    // navigate or send to `/adminPage/manageRoles/role/addPermission/`
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Assign Permissions</h2>
      <table className="w-full table-auto border-collapse border border-gray-300 scroll-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Permission Name</th>
            <th className="border border-gray-300 px-4 py-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm, index) => (
            <tr key={perm.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{perm.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => toggleSelect(perm.id)}
                  className={`px-3 py-1 rounded ${
                    selected.includes(perm.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {selected.includes(perm.id) ? 'Selected' : 'Select'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default AddPermissionsToRole