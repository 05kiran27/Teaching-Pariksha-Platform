import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeSidebar from '../../components/Home/HomeSidebar/HomeSidebar';
import { ClipLoader } from 'react-spinners';
import useProfile from '../../hooks/useProfile';
import dummyProfilePic from '../../assets/dummyProfilepic.jfif';
import { useAuthContext } from '../../context/AuthContext';
import Post from '../Post/Post';
import useConversation from '../../zustand/useConversation';  // Import useConversation
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const { profile, loading, error } = useProfile();
  const { authUser: loggedInUser } = useAuthContext();
  const { setSelectedConversation } = useConversation();  // Destructure setSelectedConversation
  const {authUser} = useAuthContext();

  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const handleEditProfile = () => {
    navigate('/edit-profile');
  }

  // Navigate to Messaging and Set Conversation
  const handleMessage = async () => {
    try {
      const token = localStorage.getItem('dv-token');
      const userId = authUser.user._id;  // Assuming the logged-in user is in authUser
      const profileId = profile._id;  // The ID of the profile the user wants to message
  
      // Step 1: Check if a conversation exists
      const checkConversationRes = await fetch(`${BACKEND_URL}/api/v1/messages/conversations/check/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('check conversation => ', checkConversationRes);
  
      const checkConversationData = await checkConversationRes.json();
      if (!checkConversationRes.ok) {
        throw new Error(checkConversationData.message || 'Failed to check conversation');
      }
  
      // If conversation exists, open the chat without sending a new message
      if (checkConversationData.conversation) {
        setSelectedConversation({
          _id: profileId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          images: profile.images,
          conversationId: checkConversationData.conversation._id, // Use existing conversation ID
        });
  
        // Navigate to the messaging page
        navigate('/messaging');
        return;  // Exit early since no need to send a message
      }
  
      // Step 2: If no conversation exists, send the "Hey there" message to create a conversation
      const createConversationRes = await fetch(`${BACKEND_URL}/api/v1/messages/message/send/${profileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: 'Hey there!', // The first message sent if no conversation exists
        }),
      });
  
      const createConversationData = await createConversationRes.json();
      if (!createConversationRes.ok) {
        throw new Error(createConversationData.message || 'Failed to send message');
      }
  
      // Set the selected conversation in global state after creating the conversation
      setSelectedConversation({
        _id: profileId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        images: profile.images,
        conversationId: createConversationData.newMessage.conversationId, // New conversation ID
      });
  
      // Navigate to the messaging page
      navigate('/messaging');
  
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to start conversation');
    }
  };
  

  return (
    <div className="flex">
      <HomeSidebar />

      {/* Divider */}
      <div className="flex h-full w-[2px] bg-slate-200 absolute left-[251px] top-[0px]"></div>

      {/* User Profile Details */}
      <div className="ml-[360px] mt-8 p-4 w-[1000px] flex flex-col gap-10">
        <div className="flex justify-between gap-10">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={profile?.images || dummyProfilePic}
                alt="Profile"
                className="h-[70px] w-[70px] object-cover border-[2px] border-red-500 rounded-full"
              />
              <div>
                <h1 className="text-3xl font-semibold">{profile?.firstName} {profile?.lastName}</h1>
                <p className="text-gray-700 mt-2">{profile?.accountType || 'N/A'}</p>
              </div>

              <div className='mx-[70px]'>
                <h2 className="text-2xl font-semibold">Connections</h2>
                <p className="text-gray-700 ">
                  {profile?.connection.length || 0} Connections
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4">
                <h2 className="text-xl font-semibold">About Me</h2>
                <p className="text-gray-700 mt-2">{profile?.additionalDetails?.about || 'No bio available.'}</p>
              </div>
            </div>
          </div>

          {/* Conditionally render Edit Profile Button */}
          {loggedInUser?.user._id === profile?._id && (
            <button
              onClick={handleEditProfile}
              className="w-[150px] mt-4 h-[40px] bg-slate-300 px-4 py-2 rounded-md shadow-md hover:scale-105 transition-transform duration-300"
            >
              Edit Profile
            </button>
          )}

          {loggedInUser?.user._id !== profile?._id && (
            <button
              onClick={handleMessage}
              className="w-[150px] mt-4 h-[40px] bg-slate-300 px-4 py-2 rounded-md shadow-md hover:scale-105 transition-transform duration-300"
            >
              Message
            </button>
          )}
        </div>

        {/* Display Posts */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            {profile?.post?.length ? (
              profile.post.map((post) => (
                <Post key={post._id} post={post} />
              ))
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
