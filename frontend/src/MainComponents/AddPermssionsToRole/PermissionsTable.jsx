import React from "react";
import { toast } from "react-toastify";
import { deletePermissionHook } from "../../utils/RolesHelper";
import TableHeaders from "../../Molecules/TableHeaders";
import RemoveRedButton from "../../Atoms/RemoveRedButton";
import SelectButton from "../../Atoms/SelectButton";

const PermissionsTable = ({
  permissions,
  selected,
  setPermissions,
  setSelected,
}) => {
  const handleDelete = async (id) => {
    alert("do you want to delete permission ?");
    const data = await deletePermissionHook(id);
    if (data.success) {
      toast.success("permission deleted successfully");
      setPermissions((prev) => prev.filter((p) => p._id !== id));
    } else {
      toast.error("something wrong happened");
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };
  const headers = ["#", "Permission Name", "Permission Description", "Select"];
  return (
    <table className="w-full table-auto border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
      <TableHeaders headers={headers} />
      <tbody className="bg-white">
        {permissions.map((perm, index) => (
          <tr
            key={perm.permission_id}
            className="hover:bg-indigo-50 transition-colors duration-200"
          >
            <td className="border border-gray-200 px-5 py-3 text-gray-700">
              {index + 1}
            </td>
            <td className="border border-gray-200 px-5 py-3 text-gray-800 font-semibold">
              {perm.permission_name
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </td>
            <td className="border border-gray-200 px-5 py-3 text-gray-700">
              {perm.permission_description}
            </td>
            <td className="border border-gray-200 px-5 py-3 text-center space-x-2 flex justify-center items-center">
              <SelectButton
                onClick={() => toggleSelect(perm.permission_id)}
                selected={selected}
                item_id={perm.permission_id}
              />
              <RemoveRedButton
                onClick={() => handleDelete(perm.permission_id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PermissionsTable;
