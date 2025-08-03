import React, { useRef, useState } from 'react';
import { verifyOTPHook } from '../../utils/AuthHooks';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const EnterOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputsRef = useRef([]);
  const navigate = useNavigate()
  const query = new URLSearchParams(useLocation().search);
  const email =query.get('email')

  console.log(email)
  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault()
    const code = otp.join('');
    if (code.length === 6) {
      const data = await verifyOTPHook(email , code );
      if(data.success){
        toast.success("OTP verified ");
        navigate(`/change-pass-otp?email=${encodeURIComponent(email)}&token=${data.token}`)
      }else{
        toast.error("OTP not verified.")
        return 
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Enter OTP</h2>
      <p className="text-gray-500 text-center mb-6">We’ve sent a 6-digit code to your email</p>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Verify OTP
      </button>
    </div>
  );
};

export default EnterOtp;
