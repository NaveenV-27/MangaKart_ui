"use client"
import { useSearchParams } from 'next/navigation'
import React from 'react'

const SearchHandler = () => {
    const searchParams = useSearchParams()
    const search = searchParams.get('query')
    return (
        <div className='flex-center text-2xl font-serif'>
            <div className='h-screen bg-amber-100 w-[20%]'>Filters</div>
            <div className='flex-center h-screen overflow-scroll bg-gray-100 text-black w-[80%]'>Search Page with {search}</div>
            
        </div>
    )
}
export default SearchHandler;
