import React ,{useEffect, useState}from 'react'
import { addPErmissionsToRoleHook, createPermissionHook, deletePermissionHook, fetchPermissionsHook, fetchRolesHook, getRoleByIdHook } from '../../utils/RolesHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddPermissionsToRole = () => {
    const [selected, setSelected] = useState([]);  
    const [permissions , setPermissions] = useState([])
    const [fetchedRolePermissions , seetFetchedRolePermissions] = useState([])
    const [isAdding , setIsAdding] = useState(false);
    const [newPermission , setNewPermission] = useState([{
      name : "" ,
      description : ""
    }])

    const { id } = useParams();
    const navigate = useNavigate();

    const fetchData = async() =>{
      const data = await fetchPermissionsHook();
      setPermissions(data)
      const roleData = await getRoleByIdHook(id);
      // console.log(roleData)
      const rolePermissionsIds = roleData.role.permissions.map(p => p.permission_id)
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

    const addNewPermission = async() =>{

      let temp =[]
      temp.push(newPermission)
      if(newPermission.permission_name === "" || newPermission.permission_description === ""){
        toast.error("please enter the required fields .")
        return null
      }
      
      const data = await createPermissionHook(temp)
      if(data.success) {
        toast.success(data.message);
        if (data.data) {
          setPermissions(prev => [...prev, ...data.data]);
        }
        setNewPermission([{ name: '', description: '' }]);
        setIsAdding(false);
      }
    }

    const handleDelete = async(id)=>{
      alert("do you want to delete permission ?")
      const data = await deletePermissionHook(id)
      if(data.success){
        toast.success("permission deleted successfully")
        setPermissions(prev => prev.filter(p => p._id !== id));
      }else{
          toast.error("something wrong happened")
      }
    }

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
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm max-w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Assign Permissions</h2>

          {isAdding ? (
            <div className="w-full md:w-auto bg-white p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Add New Permission</h3>
              <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-stretch md:items-end">
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  placeholder="Permission Name (e.g., edit_complaint)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400 transition"
                />
                <input
                  type="text"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  placeholder="Permission Description"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400 transition"
                />
                <button
                  onClick={() => addNewPermission()}
                  className="bg-indigo-400 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400 transition duration-300 ease-in-out focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-400 text-white font-semibold px-5 py-2 rounded-md shadow-sm hover:bg-indigo-500 transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            >
              Add New Permission
            </button>
          )}
        </div>

        <table className="w-full table-auto border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <thead className="bg-indigo-50">
            <tr>
              <th className="border border-gray-200 px-5 py-3 text-gray-600 text-left font-medium">#</th>
              <th className="border border-gray-200 px-5 py-3 text-gray-600 text-left font-medium">Permission Name</th>
              <th className="border border-gray-200 px-5 py-3 text-gray-600 text-left font-medium">Permission Description</th>
              <th className="border border-gray-200 px-5 py-3 text-gray-600 text-center font-medium">Select</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {permissions.map((perm, index) => (
              <tr key={perm.permission_id} className="hover:bg-indigo-50 transition-colors duration-200">
                <td className="border border-gray-200 px-5 py-3 text-gray-700">{index + 1}</td>
                <td className="border border-gray-200 px-5 py-3 text-gray-800 font-semibold">
                  {perm.permission_name
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </td>
                <td className="border border-gray-200 px-5 py-3 text-gray-700">{perm.permission_description}</td>
                <td className="border border-gray-200 px-5 py-3 text-center space-x-2 flex justify-center items-center">
                  <button
                    onClick={() => toggleSelect(perm.permission_id)}
                    className={`px-3 py-1 rounded-md font-medium shadow-sm transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      selected.includes(perm.permission_id)
                        ? 'bg-indigo-400 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {selected.includes(perm.permission_id) ? 'Selected' : 'Select'}
                  </button>
                  <button
                    onClick={() => handleDelete(perm.permission_id)}
                    className="bg-red-300 text-red-800 px-3 py-1 rounded-full hover:bg-red-400 shadow-sm transition duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-red-300"
                    title="Delete Permission"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-green-400 text-green-900 font-semibold px-8 py-3 rounded-md shadow-md hover:bg-green-500 transition duration-300 ease-in-out focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
          >
            Submit
          </button>
        </div>
      </div>


    );
}

export default AddPermissionsToRole