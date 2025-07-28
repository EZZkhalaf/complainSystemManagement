import { useScroll } from 'framer-motion';
import React, { useState } from 'react'
import { useAuthContext } from '../../Context/authContext';
import { addGroupHook } from '../../utils/GroupsHelper';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress } from 'react-loading-indicators';

const AddGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(''); 
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true)
    await addGroupHook(user._id , name , description , navigate);
    setLoading(false)
  };

  if(loading) return(
            <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
                <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            </div>
    )

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group description"
            rows="3"
            required
          />
        </div>

        

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}

export default AddGroup