"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'

const page = () => {
    const searchParams = useSearchParams()
    const manga = searchParams.get('mangaID')
    console.log(manga)
    return (
        <div className='flex-center text-2xl font-bold py-10'>
            Manga page {manga}
        </div>
    )
}

export default page
