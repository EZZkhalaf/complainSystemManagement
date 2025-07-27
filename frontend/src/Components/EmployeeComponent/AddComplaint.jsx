import React, { useState } from 'react'
import { AddComplaintHook } from '../../utils/ComplaintsHelper';
import { useAuthContext } from '../../Context/authContext';
import { useNavigate } from 'react-router-dom';

const AddComplaint = () => {
    const {user} = useAuthContext();
    const [description, setDescription] = useState('');
  const [type, setType] = useState('general');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    await AddComplaintHook(user._id , description , type , navigate);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Submit a Complaint</h2>
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-lg rounded-2xl p-6 space-y-6 border"
      >
        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block font-medium text-gray-700 mb-1">
            Type of Complaint
          </label>
          <select
            id="type"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
}

export default AddComplaint