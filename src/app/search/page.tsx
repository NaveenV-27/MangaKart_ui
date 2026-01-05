// app/search/page.tsx (Server Component, NO "use client")
import { Suspense } from 'react';
import SearchHandler from './SearchHandler'; // Import the client component

export default function SearchPage() {
  // Any server-side data fetching happens here.
  // ...

  return (
    <div>
      <h1>Search Results</h1>
      
      {/* 🎯 FIX: Wrap the component that uses the hook in Suspense */}
      <Suspense fallback={<div>Loading search parameters...</div>}>
        <SearchHandler />
      </Suspense>
    </div>
  );
}