"use client"

import axios from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'

const page = () => {

    const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<any>(null);

  const handleFileChange = (e : any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      console.log(url)
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file); // 'image' matches backend Multer field

    try {
      setUploading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manga/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Response:", res.data)
      setMessage(`Upload successful! URL: ${res.data.imageUrl}`);
    } catch (error) {
      setMessage('Upload failed.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <div className='flex-center bg-green-100 text-2xl text-black w-full h-84'>
        Admin Profile
      </div>
      <div className='flex-center  bg-blue-100 text-2xl text-black w-full h-64'>
        <ul className='flex-center gap-8 flex-col'>
              <div>
            {/* {file && <Image src={file.src} width={400} />} */}
            {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '200px', marginTop: '12px', borderRadius: '8px' }}
            />
          )}
          <input type="file" onChange={handleFileChange} accept="image/*" className='outline w-40' />
          <button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <p>{message}</p>
          </div>
          <div className='flex-center gap-8'>

              <Link href={"admin/addManga"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new Manga</Link>
              <Link href={"admin/addManga"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new volumes</Link>
              <Link href={"admin/addManga"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add new chapters</Link>
              <Link href={"admin/addManga"} className='ring-2 p-2 rounded-lg cursor-pointer'>Add Bundles/Collections</Link>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default page
