import React, { useState } from "react";
import { useAuthContext } from "../../Context/authContext";
import { deleteUserHook, editUserInfoHook } from "../../utils/UserHelper";
import defaultPhoto from "../../assets/defaultPhoto.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../Molecules/PageHeader";
import SubmitButton from "../../Atoms/SubmitButton";
import InputText from "../../Atoms/InputText";
import ImageComponent from "../../MainComponents/Settings/ImageComponent";
import InputWithLabel from "../../MainComponents/Settings/InputWithLabel";
const EditEmployeeProfile = () => {
  const { user, logout } = useAuthContext();
  const [newName, setName] = useState(user.name);
  const [newEmail, setEmail] = useState(user.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(user.profilePicture);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("newName", newName);
    formData.append("newEmail", newEmail);
    formData.append("newPassword", newPassword);
    formData.append("oldPassword", oldPassword);
    if (profileImage instanceof File) {
      formData.append("profilePicture", profileImage);
    }
    const data = await editUserInfoHook(formData, user._id);
  };

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <PageHeader
          header={"Settings"}
          paragraph={
            "Here you can see you info and edit them and change you profile picture "
          }
        />

        <div>
          <SubmitButton
            text={isEditing ? "Cancel" : "Edit Profile"}
            type={"button"}
            onClick={() => setIsEditing((prev) => !prev)}
          />
        </div>
      </div>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="max-w-xl mx-auto space-y-4"
      >
        <ImageComponent
          user={user}
          isEditing={isEditing}
          setPreview={setPreview}
          setProfileImage={setProfileImage}
          preview={preview}
        />

        <InputWithLabel
          title={"Name"}
          type={"text"}
          id={"name"}
          value={newName}
          onChange={(e) => setName(e.target.value)}
          isEditing={isEditing}
          noEditValue={user.name}
        />

        <InputWithLabel
          title={"Email"}
          type={"email"}
          id={"email"}
          value={newEmail}
          onChange={(e) => setEmail(e.target.value)}
          isEditing={isEditing}
          noEditValue={user.email}
        />

        <InputWithLabel
          title={"Old Password"}
          type={"password"}
          id={"oldPassword"}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          isEditing={isEditing}
        />

        <InputWithLabel
          title={"New Password"}
          type={"password"}
          id={"newPassword"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          isEditing={isEditing}
        />

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
      </form>
    </div>
  );
};

export default EditEmployeeProfile;
