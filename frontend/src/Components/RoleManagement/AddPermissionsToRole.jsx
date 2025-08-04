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

    const addNewPermission = async() =>{

      let temp =[]
      temp.push(newPermission)
      if(newPermission.name === "" || newPermission.description === ""){
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


    console.log(permissions)

    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Assign Permissions</h2>

          {isAdding ? (
            <div className="w-full md:w-auto">
              <h3 className="text-lg font-medium mb-2">Add New Permission</h3>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-end">
                <input
                  type="text"
                  value ={newPermission.name}
                  onChange={(e) => {
                    setNewPermission({...newPermission , name : e.target.value})
                  }}
                  placeholder="Permission Name (e.g., edit_complaint)"
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newPermission.description}
                  onChange={(e) => {
                    setNewPermission({...newPermission , description : e.target.value})
                  }}
                  placeholder="Permission Description"
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                onClick={()=> addNewPermission()}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add New Permission
            </button>
          )}
        </div>

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
                  {perm.name
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </td>
                <td className="border border-gray-300 px-4 py-2">{perm.description}</td>
                <td className="border border-gray-300 px-4 py-2 grid grid-cols-2">
                  <div className="flex items-center gap-2">
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
                  </div>
                  <button
                    onClick={() => handleDelete(perm._id)} // implement this function
                    className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600 font-bold"
                    title="Delete Permission"
                  >
                    X
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