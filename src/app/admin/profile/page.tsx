"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Activity, 
  ShieldCheck, Edit3, LogOut, Loader2, Copy, 
  UserCircle2, Hash, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AdminProfilePage = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/get_admin_profile`, {}, {
          withCredentials: true,
        });
        setProfile(response.data.data[0]);
      } catch(error) {
        console.error("Error fetching profile data:", error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("Admin ID copied to clipboard!");
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to terminate the admin session?")) return;
    
    setIsLoggingOut(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/logout`, {}, {
        withCredentials: true,
      });
      router.push('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout properly. Redirecting anyway.");
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-mono uppercase tracking-[0.2em] animate-pulse text-xs">Accessing Admin Records...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex justify-center items-center relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

      <div className="max-w-2xl w-full bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-500">
        
        {/* --- Top Banner --- */}
        <div className="h-40 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 relative">
          <div className="absolute -bottom-14 left-8">
            <div className="h-28 w-28 rounded-3xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-2xl">
              <UserCircle2 className="h-16 w-16 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* --- Header Actions --- */}
        <div className="pt-16 px-8 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{profile.full_name}</h1>
            <p className="text-indigo-400 flex items-center gap-1.5 mt-1 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> System Administrator
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition border border-slate-700">
              <Edit3 size={18} />
            </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition border border-rose-500/20 disabled:opacity-50"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            </button>
          </div>
        </div>

        {/* --- Profile Data Grid --- */}
        <div className="px-8 pb-10 space-y-6">
          
          {/* Admin ID Highlight */}
          <div className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Hash className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Identifier</p>
                <p className="text-white font-mono font-bold tracking-tight">{profile.admin_id}</p>
              </div>
            </div>
            <button 
              onClick={() => handleCopyId(profile.admin_id)}
              className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl transition text-slate-400 hover:text-white border border-slate-700"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Username</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <User size={14} className="text-indigo-500" /> @{profile.username}
              </div>
            </div>

            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
              <div className="flex items-center gap-2 text-white font-bold truncate">
                <Mail size={14} className="text-indigo-500" /> {profile.email}
              </div>
            </div>

            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <Phone size={14} className="text-indigo-500" /> {profile.phone_number || "Not Linked"}
              </div>
            </div>

            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Demographics</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <Activity size={14} className="text-indigo-500" /> 
                <span className="capitalize">{profile.gender} • {profile.age} Yrs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
             <button 
              onClick={() => router.push('/admin')}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition border border-slate-700 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> HQ Dashboard
            </button>
            <button 
              onClick={() => router.push('/')}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition shadow-xl shadow-indigo-600/20"
            >
              Public Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;