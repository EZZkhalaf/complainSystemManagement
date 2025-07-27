import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../Components/AuthLayout'
import { loginHook, registerHook } from '../utils/AuthHooks'
import { useAuthContext } from '../Context/authContext'
import { toast } from 'react-toastify'


const SingUp = () => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [name , setName] = useState("")
    const [confirmPassword , setConfirmPassword] = useState("")

    const navigate = useNavigate();
    const { login } = useAuthContext();
    const handleSubmit = async(e) =>{
        e.preventDefault()
        if(password !== confirmPassword){
            toast.error("the passwords dont match ")
            return 
        }else if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        // console.log(email,password)
        await registerHook(name ,email , password , navigate)

    }
  return (
    <AuthLayout>
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Register</h2>
        <form onSubmit={e=>handleSubmit(e)}>

            <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
            </label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            </div>

            {/* Email Input */}
            <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            </div>

            {/* Password Input */}
            <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            </div>

            <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
            </label>
            <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
                Create Account
            </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
            already Have An Account ?{' '}
            <Link to="/login" className="text-cyan-600 font-medium hover:underline">
            Login
            </Link>
        </p>
    </AuthLayout>
  )
}

export default SingUp