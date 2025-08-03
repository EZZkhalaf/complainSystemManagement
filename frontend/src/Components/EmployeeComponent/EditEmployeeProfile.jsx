
import React, { useState } from 'react'
import { useAuthContext } from '../../Context/authContext'
import { deleteUserHook, editUserInfoHook } from '../../utils/UserHelper';
import defaultPhoto from '../../assets/defaultPhoto.png'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const EditEmployeeProfile = () => {
    const {user ,logout} = useAuthContext();
    const [newName , setName] = useState(user.name)
    const [newEmail , setEmail] = useState(user.email)
    const [oldPassword , setOldPassword] = useState("")
    const [newPassword , setNewPassword] = useState("")
    const [profileImage, setProfileImage] = useState(user.profilePicture);
    const [preview, setPreview] = useState(null);
    const [isEditing , setIsEditing] = useState(false)
    const navigate = useNavigate();


    const handleSubmit = async(e)=>{
        e.preventDefault();

        const formData = new FormData();
        formData.append("newName" , newName);
        formData.append("newEmail" , newEmail);
        formData.append("newPassword" , newPassword);
        formData.append("oldPassword" , oldPassword);
        if (profileImage instanceof File) {
            formData.append("profilePicture", profileImage);
        }        
        const data = await editUserInfoHook(formData , user._id );
            
    }

    const deleteAccount = async()=>{
        alert("are you sure you want to delete you account ?")
        const data = await deleteUserHook(user._id)
        if(data.success){
            toast.success("user deleted successfully")
            logout();
            navigate("/login")
        }else{
            toast.error(data.message)
        }
    }
   return (
    <div className="container mx-auto p-4">
        <div className='flex justify-between'>

            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    onClick={() => setIsEditing(prev => !prev)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                
            </div>
        </div>
      <form 
      onSubmit={(e) =>handleSubmit(e)} 
      className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-6">

                {isEditing ? (
                    <div className="flex flex-col items-center space-y-3">
                        <img
                            src={preview || (user.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultPhoto)}
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
                            }else{
                                setProfileImage(user.profilePicture)
                                
                            }
                            }}
                            className="hidden"
                        />
                    </div>

                ):(
                    <div className=' flex flex-col '>
                        <img
                            src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultPhoto}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-full border border-gray-300"
                        />

                    </div>
                )}
                
            </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>

          {isEditing ? (
          <input
            type="text"
            id="name"
            name="name"
            value={newName}
            onChange={e=> setName(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />):(
            <p className="mt-1 p-2 border border-gray-200 bg-gray-50 rounded">{user.name}</p>
          )}
        </div>




        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>

          {isEditing ? (

              <input
                type="email"
                id="email"
                name="email"
                value={newEmail}
                onChange={e=> setEmail(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
          ):(
            <p className="mt-1 p-2 border border-gray-200 bg-gray-50 rounded">{user.email}</p>
          )}
        </div>
        



        <div>
            {isEditing ? (
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Old Password
                </label>
                <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={oldPassword}
                    onChange={e=> setOldPassword(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
          </div>
            ):(
                <></>
            )}
        </div>
        



        <div>
            {isEditing ? (
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                    </label>
                    <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={e=> setNewPassword(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            ):(<></>)}
        </div>



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
                    onClick={()=>deleteAccount()}
                        className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Delete Account
                    </button>
                    
                    </div>

            ):(<></>)}
        </div>
      </form>
    </div>
  );
}

export default EditEmployeeProfile