


import React, { useState } from 'react';
import { sendOtpToEmailHook } from '../../utils/AuthHooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EnterEmail = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);  // start loading
    try {
      const data = await sendOtpToEmailHook(email, navigate);
      if (data.success) {
        toast.success('OTP sent to email successfully.');
        navigate('/otp-confirm', { state: { email } });
        
      } 
    } catch (error) {
      toast.error('Network error, please try again.');
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
          Forgot Password ?
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a one-time code.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // disable input while loading
          />
          <button
            type="submit"
            className={`w-full p-2 rounded-md text-white transition ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={loading} // disable button while loading
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterEmail;
