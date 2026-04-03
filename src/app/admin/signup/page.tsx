"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Lock, Phone, Users, Activity,
  CheckCircle, XCircle, Loader2, UserPlus2, ChevronDown,
  Eye, EyeOff, Clipboard, Home, ShieldCheck
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [allowSignup, setAllowSignup] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: ""
  });

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
      setUsernameStatus(response.data.isValid ? 'available' : 'taken');
    } catch (err) {
      setUsernameStatus('invalid'); 
    } finally {
      setIsCheckingUsername(false);
    }
  };

  useEffect(() => {
    const username = formData.username.trim();
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (username.length === 0) {
      setUsernameStatus(null);
      return;
    }
    if (!isUsernameValidFormat(username)) {
      setUsernameStatus('invalid');
      return;
    }
    const timeoutId = setTimeout(() => checkUsernameUniqueness(username), 500);
    setDebounceTimeout(timeoutId);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  useEffect(() => {
      const requiredFields = [formData.username, formData.full_name, formData.email, formData.password, formData.age, passwordConfirm];
      const allFieldsFilled = requiredFields.every(field => field && String(field).trim() !== '');
      const passwordsMatch = formData.password === passwordConfirm && formData.password.length >= 8;
      const usernameCheckPassed = usernameStatus === 'available' && !isCheckingUsername;

      setAllowSignup(allFieldsFilled && passwordsMatch && usernameCheckPassed);
  }, [formData, passwordConfirm, usernameStatus, isCheckingUsername]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = { ...formData, age: parseInt(formData.age) };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/create_admin_profile`, payload, { withCredentials: true });

      if(response.data.apiSuccess === 1) {
        setSuccessModal({
          isOpen: true,
          message: response.data.admin_id
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Admin ID copied!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
        <header className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-600/10 rounded-2xl mb-4">
            <UserPlus2 className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Admin Signup</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Access the control center</p>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
            <XCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username */}
          <div className="space-y-1.5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Unique Username"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 outline-none transition-all font-medium"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? <Loader2 className="animate-spin h-5 w-5 text-indigo-500" /> : 
                 usernameStatus === 'available' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : 
                 (usernameStatus === 'taken' || usernameStatus === 'invalid') ? <XCircle className="h-5 w-5 text-rose-500" /> : null}
              </div>
            </div>
            {usernameStatus === 'invalid' && <p className="text-rose-500 text-[10px] font-black uppercase ml-2 tracking-widest">Invalid Format (4-20 chars)</p>}
            {usernameStatus === 'taken' && <p className="text-rose-500 text-[10px] font-black uppercase ml-2 tracking-widest">Already Registered</p>}
            {usernameStatus === 'available' && <p className="text-emerald-500 text-[10px] font-black uppercase ml-2 tracking-widest">ID Available</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" className="signup-input pl-12" required />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input type="tel" name="phone_number" value={formData.phone_number} maxLength={10} onChange={handleChange} placeholder="Phone" className="signup-input pl-12" />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="signup-input pl-12" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="13" max="120" className="signup-input pl-12" required />
            </div>
            <div className="relative">
              <select name="gender" value={formData.gender} onChange={handleChange} className="signup-input appearance-none px-4">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Passwords */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Master Password (min 8)" className="signup-input pl-12 pr-12" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input type={showConfirmPassword ? 'text' : 'password'} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirm Master Password" className={`signup-input pl-12 pr-12 ${passwordConfirm.length > 0 && formData.password !== passwordConfirm ? 'border-rose-500/50' : ''}`} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !allowSignup}
            className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Initialize Account'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-8 font-bold uppercase tracking-widest">
          Existing Command? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 ml-1 underline decoration-2 underline-offset-4">Sign In</Link>
        </p>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center scale-in-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Authenticated</h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              Your Admin profile is live. Your secure Access ID is below:
            </p>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-8 flex items-center justify-between group">
               <code className="text-indigo-400 font-mono font-bold">{successModal.message}</code>
               <button onClick={() => copyToClipboard(successModal.message)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <Clipboard size={16} />
               </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Home size={18} /> Finish Setup
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .signup-input {
          width: 100%;
          padding-top: 0.875rem;
          padding-bottom: 0.875rem;
          border-radius: 1rem;
          background-color: #020617; /* slate-950 */
          border: 1px solid #1e293b; /* slate-800 */
          color: white;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .signup-input:focus {
          border-color: #6366f1; /* indigo-500 */
          box-shadow: 0 0 0 1px #6366f1;
        }
        .signup-input::placeholder {
          color: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default SignupPage;