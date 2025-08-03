import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { changePasswordOTPHook } from '../../utils/AuthHooks';
import { useLocation, useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
const query = new URLSearchParams(useLocation().search);
const email = query.get('email')
const token = query.get('token')
const navigate = useNavigate()
if(!email) navigate("/login")
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("passwords dont match!")
      return;
    }
    console.log(email)
    const data = await changePasswordOTPHook(email , password , token)
    if(data.success){
        toast.success(data.message);
        navigate('/login')
    }else{
        toast.error(data.message)
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
