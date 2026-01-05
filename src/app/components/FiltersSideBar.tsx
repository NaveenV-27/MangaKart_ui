import React from 'react'

const FiltersSideBar = () => {
  return (
    <div className='h-[80vh] w-2/5 bg-black/30 text-xl flex-center'>
      <div className='text-2xl w-full px-4 flex flex-col'>
        <span className='text-2xl font-stretch-75% font-semibold'>
          Set filters
        </span>
        <div className='bg-black/50 p-2 w-full rounded-xl'>
          genres
        </div>
      </div>
    </div>
  )
}

export default FiltersSideBar;
