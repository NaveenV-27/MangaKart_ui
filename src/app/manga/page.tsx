"use client";
import React from 'react';
import FiltersSideBar from '../components/FiltersSideBar';

const page = () => {
    return (
        <div className='h-full flex'>
            <FiltersSideBar/>
            <div className='flex-center text-2xl font-bold py-10 w-full'>
                Browse some of the most popular series out there
            </div>
        </div>
    )
}

export default page
