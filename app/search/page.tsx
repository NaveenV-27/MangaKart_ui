"use client"
import { useSearchParams } from 'next/navigation'
import React from 'react'

const page = () => {
    const searchParams = useSearchParams()
    const query = searchParams.get('query')
    return (
        <div className='flex-center text-2xl font-serif'>
            <div className='h-screen bg-amber-100 w-[20%]'>.</div>
            <div className='flex-center h-screen bg-gray-100 text-black w-[80%]'>Search page with {query}</div>
            
        </div>
    )
}

export default page
