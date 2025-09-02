import React from "react";

const ImageComponent = ({
  user,
  isEditing,
  setProfileImage,
  setPreview,
  preview,
}) => {
  return (
    <div className="flex flex-col md:flex-row    gap-6">
      {isEditing ? (
        <div className="flex flex-col items-center space-y-3">
          <img
            src={
              preview ||
              (user.profilePicture
                ? `http://localhost:5000${user.profilePicture}`
                : defaultPhoto)
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-md"
          />
          <label
            htmlFor="profileImage"
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium select-none"
          >
            Choose New Photo
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setProfileImage(file);
                setPreview(URL.createObjectURL(file));
              } else {
                setProfileImage(user.profilePicture);
              }
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className=" flex flex-col ">
          <img
            src={
              user.profilePicture
                ? `http://localhost:5000${user.profilePicture}`
                : defaultPhoto
            }
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border border-gray-300"
          />
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
