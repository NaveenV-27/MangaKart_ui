"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { 
  BookPlus, Layers, FilePlus, Package, 
  TrendingUp, Trophy, Loader2, ChevronRight, 
  BarChart3
} from "lucide-react";

interface AdminStatItem {
  volume_id: string;
  volume_title?: string;
  manga_id?: string;
  manga_title?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const actions = [
    { title: "Add New Manga", description: "Create a new entry", href: "/admin/addManga", icon: BookPlus, color: "text-blue-400" },
    { title: "Add Volumes", description: "Manage volumes", href: "/admin/addVolume", icon: Layers, color: "text-indigo-400" },
    { title: "Add Chapters", description: "Upload chapters", href: "/admin/addChapter", icon: FilePlus, color: "text-emerald-400" },
    { title: "Add Bundles", description: "Create bundles", href: "/admin/addCollection", icon: Package, color: "text-amber-400" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/admin_stats`, {
          withCredentials: true
        });
        if (response.data.apiSuccess === 1) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-12 px-6 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-indigo-500" size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Real-time Analytics</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
              Executive View
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Inventory</p>
                <p className="text-2xl font-black text-white">{loading ? "..." : stats.length}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: Top Selling Volumes (Analytics) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between ml-2">
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-500" size={22} />
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Top Selling Volumes</h2>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Calculating Metrics...</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {stats.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center gap-6 hover:bg-indigo-600/5 transition-colors group">
                    {/* Rank Number */}
                    <div className="relative shrink-0">
                       <span className={`text-4xl font-black italic ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-600' : 'text-slate-800'}`}>
                          0{idx + 1}
                       </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-mono text-indigo-400/80 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{item.volume_id}</span>
                      </div>
                      <h3 className="text-lg font-black text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                        {item.volume_title || "Standard Release"}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Series: <span className="text-slate-300">{item.manga_title || "Standalone"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Performance</p>
                       <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${100 - (idx * 15)}%` }} 
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <BarChart3 className="text-indigo-500" size={20} />
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Quick Operations</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {actions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl transition-all hover:border-indigo-500/50 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform ${action.color}`}>
                    <action.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{action.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
              </Link>
            ))}
          </div>

          <div className="mt-8 p-8 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-white font-black uppercase text-xl italic tracking-tighter mb-2">Monthly Audit</h3>
                <p className="text-indigo-100 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest opacity-80">
                   Generate full report for all volumes sold and inventory levels.
                </p>
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-100 transition-colors">
                   Download CSV
                </button>
             </div>
             <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;