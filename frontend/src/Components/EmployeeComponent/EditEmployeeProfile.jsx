import { useState } from "react";
import { useAuthContext } from "../../Context/authContext";
import { editUserInfoHook } from "../../utils/UserHelper";
import PageHeader from "../../Molecules/PageHeader";
import SubmitButton from "../../Atoms/SubmitButton";
import ImageComponent from "../../MainComponents/Settings/ImageComponent";
import InputWithLabel from "../../MainComponents/Settings/InputWithLabel";
import EditDeleteProfileButtons from "../../Molecules/EditDeleteProfileButtons";
import UserDataAndEditForm from "../../MainComponents/EditEmployee/UserDataAndEditForm";

const EditEmployeeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

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

      <UserDataAndEditForm isEditing={isEditing} />
    </div>
  );
};

export default EditEmployeeProfile;
