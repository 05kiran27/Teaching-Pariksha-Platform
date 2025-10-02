import React from 'react'
import HomeSidebar from '../../components/Home/HomeSidebar/HomeSidebar'
import HomeMain from '../../components/Home/HomeMain/HomeMain'

const Home = () => {
  return (
    <div className='flex bg-gray-50 w-screen flex-row relative'>
      <HomeSidebar />
      <div className='flex h-full w-[2px] bg-slate-200 absolute left-[251px] top-[0px]'></div>
      <HomeMain/>
    </div>
    
  )
}

export default Home

