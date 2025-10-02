import React, { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuthContext } from '../../../context/AuthContext';
import LogoutButton from '../../LogoutButton';
import NotificationModal from '../../Home/HomeSidebar/NotificationModal';
import AddPostForm from '../../Post/AddPostForm'; // Import AddPostForm
import toast from 'react-hot-toast';

const AdminHeader = () => {
  const { authUser } = useAuthContext();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isAddPostOpen, setAddPostOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false); // For full-screen loader if needed

  const toggleNotificationModal = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  const handleAddPostClick = () => {
    setAddPostOpen(true);
  };

  const handleCloseAddPost = () => {
    setAddPostOpen(false);
  };

  const handlePostCreate = (loading) => {
    setIsPosting(loading); // Trigger full-screen loader if you have one
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md w-full sticky top-0 z-50">
      {/* Left side: Logo / Branding */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-800">Dev&Innove Admin</h1>
      </div>

      {/* Right side: Admin info and actions */}
      <div className="flex items-center gap-6">
        {/* Add Post Button */}
        <button
          onClick={handleAddPostClick}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Add Post
        </button>

        {/* Admin Name */}
        <div className="flex flex-col items-end">
          <span className="font-semibold text-gray-700">
            {authUser?.user?.firstName || 'Admin'}
          </span>
          <span className="text-sm text-gray-500">Administrator</span>
        </div>

        

        {/* Logout */}
        <LogoutButton />
      </div>

      {/* Notification Modal */}
      <NotificationModal isOpen={isNotificationOpen} onClose={toggleNotificationModal} />

      {/* Add Post Modal */}
      {isAddPostOpen && (
        <AddPostForm onClose={handleCloseAddPost} onPostCreate={handlePostCreate} />
      )}

      {/* Optional: Full-screen loader */}
      {isPosting && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="text-white text-lg font-semibold">Posting...</div>
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
