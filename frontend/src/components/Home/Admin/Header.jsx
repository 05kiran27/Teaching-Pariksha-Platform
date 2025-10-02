import React from 'react'
import LogoutButton from '../../LogoutButton';

const Header = () => {
  return (
    <div className='flex bg-gray-50 w-screen flex-row relative'>
        <div>
            <LogoutButton/>
        </div>
    </div>
    
  )
}

export default Header