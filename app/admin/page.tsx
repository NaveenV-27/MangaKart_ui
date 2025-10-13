"use client"

import axios from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'

const page = () => {

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div>
      <div className='flex-center bg-green-100 text-2xl text-black w-full h-84'>
        Admin Profile
      </div>
      <div className='flex-center  bg-blue-100 text-2xl text-black w-full h-64'>
        <ul className='flex-center gap-8 flex-col'>
          <div className='flex-center gap-8'>

              <Link href={"admin/addManga"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new Manga</Link>
              <Link href={"admin/addVolume"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new volumes</Link>
              <Link href={"admin/addChapter"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new chapters</Link>
              <Link href={"admin/addCollection"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add Bundles/Collections</Link>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default page
