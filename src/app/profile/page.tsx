"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Activity, 
  ShieldCheck, Edit3, LogOut, Loader2,
  UserCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Mock API Call ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get_user_profile`, {}, {
          withCredentials: true,
        })
        console.log("Profile data:", response.data);
        setProfile(response.data.data[0]);
      } catch(error) {
        console.error("Error fetching profile data:", error);
      }

      // setProfile(mockData);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const logout = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/logout`, {} ,{
        withCredentials: true,
      });
      console.log("Logout response:", response.data);
      router.push('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400 animate-pulse">Loading Admin Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* --- Top Banner & Avatar --- */}
        <div className="h-32 bg-gradient-to-r from-slate-700 to-gray-800 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-2xl bg-gray-700 border-4 border-gray-800 flex items-center justify-center shadow-lg">
              <UserCircle2 className="h-16 w-16 text-blue-400" />
            </div>
          </div>
        </div>

        {/* --- Header Actions --- */}
        <div className="pt-16 px-8 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{profile.full_name}</h1>
            <p className="text-blue-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="h-4 w-4" /> Verified mangakart user
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition border border-gray-600">
              <Edit3 className="h-5 w-5" />
            </button>
            <button 
              onClick={logout}
              title='Logout'
              className="p-2 bg-red-900/20 hover:bg-red-900/40 rounded-lg text-red-400 transition border border-red-900/50 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* --- Profile Data Grid --- */}
        <div className="px-8 pb-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <User className="h-4 w-4 text-blue-400" />
                <span>@{profile.username}</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>{profile.phone_number || "N/A"}</span>
              </div>
            </div>

            {/* Age & Gender */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Demographics</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="capitalize">{profile.gender} • {profile.age} yrs</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;