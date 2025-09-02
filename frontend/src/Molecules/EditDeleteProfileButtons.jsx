import React from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../Context/authContext";
import { useNavigate } from "react-router-dom";

const EditDeleteProfileButtons = ({ isEditing }) => {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const deleteAccount = async () => {
    alert("are you sure you want to delete you account ?");
    const data = await deleteUserHook(user._id);
    if (data.success) {
      toast.success("user deleted successfully");
      logout();
      navigate("/login");
    } else {
      toast.error(data.message);
    }
  };
  return (
    <div>
      {isEditing ? (
        <div className="flex justify-between gap-4">
          <button
            type="submit"
            // onSubmit={(e) =>handleSubmit(e)}
            className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Save Settings
          </button>

          <button
            onClick={() => deleteAccount()}
            className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Delete Account
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default EditDeleteProfileButtons;
