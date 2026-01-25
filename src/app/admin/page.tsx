"use client";

import Link from "next/link";
import React from "react";
import { BookPlus, Layers, FilePlus, Package } from "lucide-react";

const page = () => {
  const actions = [
    {
      title: "Add New Manga",
      description: "Create a new manga series entry",
      href: "/admin/addManga",
      icon: BookPlus,
    },
    {
      title: "Add Volumes",
      description: "Manage and add manga volumes",
      href: "/admin/addVolume",
      icon: Layers,
    },
    {
      title: "Add Chapters",
      description: "Upload and organize chapters",
      href: "/admin/addChapter",
      icon: FilePlus,
    },
    {
      title: "Add Bundles",
      description: "Create collections or bundles",
      href: "/admin/addCollection",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-semibold tracking-wide">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Manage manga, volumes, chapters, and collections
        </p>
      </div>

      {/* Action Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl bg-slate-800 border border-slate-700 p-6
                         hover:bg-slate-700 hover:border-slate-500
                         transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl
                              bg-slate-700 group-hover:bg-slate-600 mb-4">
                <Icon className="w-6 h-6 text-slate-200" />
              </div>

              <h2 className="text-lg font-medium mb-1">
                {action.title}
              </h2>
              <p className="text-sm text-slate-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default page;
