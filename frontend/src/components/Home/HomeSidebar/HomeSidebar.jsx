

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineTravelExplore, MdNotificationsActive } from "react-icons/md";
import { TbMessageCircleShare } from "react-icons/tb";
import LogoutButton from '../../LogoutButton';
import NotificationModal from './NotificationModal';
import { MdAddModerator } from "react-icons/md";
import useUnreadNotification from '../../../hooks/useUnreadNotification'; 
import { useAuthContext } from '../../../context/AuthContext';

const HomeSidebar = ({ onAddPostClick }) => {
  const { authUser } = useAuthContext();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const unreadCount = useUnreadNotification(); // Fetch unread count from the custom hook

  // Function to toggle notification modal visibility
  const toggleNotificationModal = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  return (
    <div className='flex flex-col w-[250px] h-screen gap-10 justify-between pb-[30px] fixed'>
      {/* Upper home sidebar */}
      <div className='flex flex-col gap-7 pl-4 '>
        <h1 className='font-bold text-3xl text-blue-800'>Dev&Innove</h1>

        {/* Home */}
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 ${
              isActive ? 'bg-gray-200' : ''
            }`
          }
        >
          <FaHome className='h-[30px] w-[30px]'/>
          <p className='text-xl font-semibold py-[2px]'>Home</p>
        </NavLink>

        {/* Search */}
        <NavLink 
          to="/search" 
          className={({ isActive }) => 
            `flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 ${
              isActive ? 'bg-gray-200' : ''
            }`
          }
        >
          <IoSearchOutline className='h-[30px] w-[30px]'/>
          <p className='text-xl font-semibold py-[2px]'>Search</p>
        </NavLink>

        {/* Explore */}
        <NavLink 
          to="/explore" 
          className={({ isActive }) => 
            `flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 ${
              isActive ? 'bg-gray-200' : ''
            }`
          }
        >
          <MdOutlineTravelExplore className='h-[30px] w-[30px]'/>
          <p className='text-xl font-semibold py-[2px]'>Explore</p>
        </NavLink>

        {/* Add Post */}
        {authUser?.user?.accountType?.toLowerCase() === 'admin' && (
          <div 
            onClick={onAddPostClick} 
            className="flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent rounded-md cursor-pointer hover:bg-gray-200"
          >
            <MdAddModerator className='h-[30px] w-[30px]'/>
            <p className='text-xl font-semibold py-[2px]'>Add Post</p>
          </div>
        )}

        {/* Messaging */}
        <NavLink 
          to="/messaging" 
          className={({ isActive }) => 
            `flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 ${
              isActive ? 'bg-gray-200' : ''
            }`
          }
        >
          <TbMessageCircleShare className='h-[30px] w-[30px]'/>
          <p className='text-xl font-semibold py-[2px]'>Messaging</p>
        </NavLink>

        {/* Notification */}
        <div 
          onClick={toggleNotificationModal} 
          className="flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 relative"
        >
          <MdNotificationsActive className='h-[30px] w-[30px]'/>
          <p className='text-xl font-semibold py-[2px]'>Notification</p>

          {/* Badge to show unread notifications */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-[20px] w-[20px] flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Quiz - for normal users only */}
        {authUser?.user?.accountType?.toLowerCase() !== 'admin' && (
          <NavLink 
            to="/quiz" 
            className={({ isActive }) => 
              `flex w-[180px] pr-[2px] py-[4px] gap-5 border border-transparent transition duration-300 ease-in-out transform rounded-md cursor-pointer hover:bg-gray-200 ${
                isActive ? 'bg-gray-200' : ''
              }`
            }
          >
            <MdOutlineTravelExplore className='h-[30px] w-[30px]' />
            <p className='text-xl font-semibold py-[2px]'>Quiz</p>
          </NavLink>
        )}


      </div>

      {/* Bottom home sidebar */}
      <div>
        <LogoutButton/>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={toggleNotificationModal}
      />
    </div>
  );
};

export default HomeSidebar;
