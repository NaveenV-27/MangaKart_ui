import React from 'react'

const page = async ({params} : any) => {
    const genre = (await params).genre;
    console.log(genre);
  return (
    <div className='flex-center w-full text-3xl h-screen'>
      Genre - {genre}
    </div>
  )
}

export default page
