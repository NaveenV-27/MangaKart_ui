"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Lock, Phone, Users, Activity,
  CheckCircle, XCircle, Loader2, UserCheck2, ChevronDown,
  Eye, EyeOff, Clipboard, Home // New icons for toggling visibility
} from 'lucide-react';

// Define status types
type UsernameStatus = 'available' | 'taken' | 'invalid' | null;

const SignupPage = () => {
  const router = useRouter();
  const initialState = {
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    gender: 'male',
    age: '',
  };
  const [formData, setFormData] = useState(initialState);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  // --- New State for Password Visibility ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ----------------------------------------

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- State for Username Check ---
  const [allowSignup, setAllowSignup] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [successModal, setSuccessModal] = useState({
    isOpen : false,
    message : ""
  });

  // --- Utility Functions ---

  const isUsernameValidFormat = (username: string): boolean => {
    return /^[a-zA-Z0-9_-]{4,20}$/.test(username);
  };
  
  const checkUsernameUniqueness = async (username: string) => {
    setIsCheckingUsername(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/check_username`, 
        { username }
      );
      
      if (response.data.isValid === true) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('taken');
      }
    } catch (err) {
      console.error("Username check failed:", err);
      setUsernameStatus('invalid'); 
      setError("Failed to check username availability.");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // --- Effects ---

  // 1. Username Debounce Effect
  useEffect(() => {
    const username = formData.username.trim();

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (username.length === 0) {
      setUsernameStatus(null);
      setIsCheckingUsername(false);
      return;
    }

    if (!isUsernameValidFormat(username)) {
      setUsernameStatus('invalid');
      setIsCheckingUsername(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsernameUniqueness(username);
    }, 500);

    setDebounceTimeout(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [formData.username]);


  // 2. Allow Signup Status Effect (updated to include usernameStatus)
  useEffect(() => {
      const requiredFields = [
          formData.username,
          formData.full_name,
          formData.email,
          formData.password,
          formData.age,
          passwordConfirm,
      ];

      const allFieldsFilled = requiredFields.every(field => 
          field && String(field).trim() !== ''
      );
      
      const passwordsMatch = formData.password === passwordConfirm && formData.password.length > 0;
      
      const usernameCheckPassed = usernameStatus === 'available' && !isCheckingUsername;

      if (allFieldsFilled && passwordsMatch && usernameCheckPassed) {
          setAllowSignup(true);
      } else {
          setAllowSignup(false);
      }
  }, [
      formData.username, 
      formData.full_name, 
      formData.email, 
      formData.password, 
      formData.age, 
      passwordConfirm,
      usernameStatus, 
      isCheckingUsername 
  ]);


  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!isUsernameValidFormat(formData.username)) {
      return "Username format is invalid (4-20 chars, alphanumeric, - or _).";
    }
    if (usernameStatus === 'taken') {
      return "Username is already taken. Please choose another.";
    }
    if (!formData.full_name || !formData.email || !formData.password || !formData.age) {
        return "All mandatory fields must be filled out.";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (formData.password !== passwordConfirm) {
      // This is now handled by inline feedback, but kept for final submission check
      return "Passwords do not match.";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        return "Please enter a valid email address.";
    }
    if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
        return "Age must be between 13 and 120.";
    }
    return ''; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      
      const payload = {
        ...formData,
        age: parseInt(formData.age),
      };

      console.log("Payload:", payload);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/create_admin_profile`,
        payload,
        {
          withCredentials: true,
        }
      );

      if(response.data.apiSuccess === 1) {

        console.log(response.data);
        setSuccess("Account created successfully! Redirecting to login...");
        setSuccessModal({
          isOpen : true,
          message : "Account created successfully! Your admin Id is : " + response.data.admin_id
        })
      }
      // setTimeout(() => {
      //   router.push('/login');
      // }, 2000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const apiError = err.response?.data?.message || "Registration failed due to a server error.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUsernameIcon = () => {
    if (isCheckingUsername) {
      return <Loader2 className="animate-spin h-5 w-5 text-blue-400" />;
    }
    if (usernameStatus === 'available') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };
  
  // Checks if passwords mismatch AND if both fields have been touched (not empty)
  const passwordsMismatch = 
    passwordConfirm.length > 0 && 
    formData.password.length > 0 && 
    formData.password !== passwordConfirm;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: You could add a temporary "Copied!" toast here
    alert("Admin ID copied to clipboard!");
  };

  // --- Render ---
  return (
    <div className="flex-center min-h-[90vh] bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg text-gray-300">
        <h1 className="text-4xl font-extrabold text-white text-center mb-2 flex-center gap-2">
          <UserCheck2 className=' w-8 h-8 self-baseline-last'/>
          Sign Up
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Create your Admin account.
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
          
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {renderUsernameIcon()}
            </div>
          </div>
          {!isCheckingUsername && usernameStatus === 'taken' && (
              <p className="text-red-400 text-sm -mt-3">Username is already taken.</p>
          )}
          {usernameStatus === 'invalid' && (
              <p className="text-red-400 text-sm -mt-3">Invalid format (4-20 chars, alphanumeric, - or _).</p>
          )}
          {!isCheckingUsername && usernameStatus === 'available' && (
              <p className="text-green-400 text-sm -mt-3">Username available!</p>
          )}

          {/* Full Name */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
          </div>
          
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              maxLength={10}
              onChange={handleChange}
              placeholder="Phone Number (Optional)"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>
          
          {/* Age and Gender (Side by Side) */}
          <div className="flex gap-4">
            {/* Age */}
            <div className="relative flex-1">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                min="13"
                max="120"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Gender */}
            <div className="relative flex-1">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-3 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
              >
                <option value="prefer not to say">prefer not to say</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Password (Toggle Visibility) */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password (min 8 characters)"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
            </button>
          </div>
          
          {/* Confirm Password (Toggle Visibility) */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            >
              {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
            </button>
          </div>
          {/* Password Mismatch Feedback */}
          {passwordsMismatch && (
              <p className="text-red-400 text-sm -mt-3">⚠️ Passwords do not match.</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !allowSignup}
            className="w-full py-3 mt-6 bg-[#566784] text-white font-semibold rounded-lg hover:bg-slate-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-6">
          Already have an account? 
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium ml-1">
            Log In
          </Link>
        </p>
      </div>
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-400 mb-6">{successModal.message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                   const id = successModal.message.split(': ').pop() || '';
                   copyToClipboard(id);
                }}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 cursor-pointer text-white rounded-lg transition flex items-center justify-center gap-2 border border-gray-600"
              >
                <Clipboard className="h-5 w-5 font-bold" />
                Copy Admin ID
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 cursor-pointer text-white font-semibold rounded-lg transition shadow-lg shadow-blue-500/20 flex-center gap-2"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;