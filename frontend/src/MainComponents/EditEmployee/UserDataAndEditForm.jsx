import React, { useState } from "react";
import ImageComponent from "../Settings/ImageComponent";
import { useAuthContext } from "../../Context/authContext";
import { editUserInfoHook } from "../../utils/UserHelper";
import InputWithLabel from "../Settings/InputWithLabel";
import EditDeleteProfileButtons from "../../Molecules/EditDeleteProfileButtons";

const UserDataAndEditForm = ({ isEditing }) => {
  const { user } = useAuthContext();
  const [newName, setName] = useState(user.name);
  const [newEmail, setEmail] = useState(user.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(user.profilePicture);
  const [preview, setPreview] = useState(null);

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

  return (
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

      <EditDeleteProfileButtons isEditing={isEditing} user={user} />
    </form>
  );
};

export default UserDataAndEditForm;
