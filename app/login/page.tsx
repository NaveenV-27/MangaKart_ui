"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, UserCheck2 } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    usernameOrEmail: '', // Field for user to enter either username or email
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Input Change Handler ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usernameOrEmail || !formData.password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      
      const payload = {
        identifier: formData.usernameOrEmail, // Send field as 'identifier'
        password: formData.password,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/login`,
        payload,
        {
          withCredentials: true
        }
      );

      if(response.data.apiSuccess === 1) {
        // Assuming successful login returns a token or user object
        console.log("Login successful:", response.data);
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push('/'); 
        }, 1500);
      } else {
        setError(response.data.message || "Invalid cridentials");
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const apiError = err.response?.data?.message || "Invalid credentials or server error.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---

  return (
    <div className="flex-center min-h-[90vh] bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-sm text-gray-300">
        <h1 className="text-4xl font-extrabold text-white text-center mb-2 flex-center gap-2">
          <UserCheck2 className=' w-8 h-8 self-baseline-last'/>
          Log In
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Welcome back to MangaKart!
        </p>

        {/* --- Feedback Messages --- */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900 border border-green-700 text-green-300 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username or Email */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Username or Email"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Password (Toggle Visibility) */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
            </button>
          </div>
          
          {/* <p className="text-right text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
            Forgot Password?
          </p> */}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-[#566784] text-white font-semibold rounded-lg hover:bg-slate-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-6">
          Dont have an account? 
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;