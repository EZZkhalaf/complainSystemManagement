import React ,{useEffect, useState}from 'react'
import { addPErmissionsToRoleHook, fetchPermissionsHook, fetchRolesHook, getRoleByIdHook } from '../../utils/RolesHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddPermissionsToRole = () => {
    const [selected, setSelected] = useState([]);  
    const [permissions , setPermissions] = useState([])
    const [fetchedRolePermissions , seetFetchedRolePermissions] = useState([])

    const { id } = useParams();
    const navigate = useNavigate();

    const fetchData = async() =>{
      const data = await fetchPermissionsHook();
      setPermissions(data)

      const roleData = await getRoleByIdHook(id);
      const rolePermissionsIds = roleData.role.permissions.map(p => p._id)
      seetFetchedRolePermissions(roleData.role.permissions)
      setSelected(rolePermissionsIds)
    }
    useEffect(()=>{
      fetchData();
    },[])

    const toggleSelect = (id) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
      );
    };

    const handleSubmit = async() => {
      let permissionsIds = selected;
      let roleId = id;
      const data = await addPErmissionsToRoleHook(roleId , permissionsIds);
      if(data.success){
        toast.success(data.message)
        navigate(-1);
      }else{
        toast.error(data.message)
      }

    };

    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Assign Permissions</h2>
        <table className="w-full table-auto border-collapse border border-gray-300 scroll-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Permission Name</th>
              <th className="border border-gray-300 px-4 py-2">Permission Description</th>
              <th className="border border-gray-300 px-4 py-2">Select</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm, index) => (
              <tr key={perm._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {perm.name.split('_')
                  .map( w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")
                  }</td>
                <td className="border border-gray-300 px-4 py-2">{perm.description}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => toggleSelect(perm._id)}
                    className={`px-3 py-1 rounded ${
                      selected.includes(perm._id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {selected.includes(perm._id) ? 'Selected' : 'Select'}
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