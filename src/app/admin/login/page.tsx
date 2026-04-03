"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, UserCheck2, Loader2, ShieldAlert } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    usernameOrId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usernameOrId || !formData.password) {
      setError("Identification and access key required.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        identifier: formData.usernameOrId,
        password: formData.password,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/admin_login`,
        payload,
        { withCredentials: true }
      );

      if (response.data.apiSuccess === 1) {
        setSuccess("Access Granted. Redirecting to HQ...");
        setTimeout(() => {
          router.push('/'); 
        }, 1500);
      } else {
        setError(response.data.message || "Invalid credentials provided.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const apiError = err.response?.data?.message || "Authentication failed. Server unreachable.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <header className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-600/10 rounded-2xl mb-4">
            <UserCheck2 className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Admin Login</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Welcome back, Commander</p>
        </header>

        {/* --- Feedback Messages --- */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
            <ShieldAlert size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
            <UserCheck2 size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username or Email */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              name="usernameOrId"
              value={formData.usernameOrId}
              onChange={handleChange}
              placeholder="Username or Admin ID"
              className="login-input pl-12"
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Access Password"
              className="login-input pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Authenticating...
              </>
            ) : (
              'Enter Command Center'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-8 font-bold uppercase tracking-widest">
          No clearance? <Link href="/admin/signup" className="text-indigo-400 hover:text-indigo-300 ml-1 underline decoration-2 underline-offset-4">Register Admin</Link>
        </p>
      </div>

      <style jsx>{`
        .login-input {
          width: 100%;
          padding-top: 0.875rem;
          padding-bottom: 0.875rem;
          border-radius: 1.25rem;
          background-color: #020617; /* slate-950 */
          border: 1px solid #1e293b; /* slate-800 */
          color: white;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #6366f1; /* indigo-500 */
          box-shadow: 0 0 0 1px #6366f1;
        }
        .login-input::placeholder {
          color: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default LoginPage;