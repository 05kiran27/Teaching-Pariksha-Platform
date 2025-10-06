import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostBox from '../../Post/PostBox';
import useGetFeed from '../../../hooks/useGetFeed';
import useGetUserProfile from '../../../hooks/useGetUserProfile'; 
import { ClipLoader } from 'react-spinners';
import HomeHeader from './HomeHeader';
import HomeSidebar from '../HomeSidebar/HomeSidebar'; 
import AddPostForm from '../../Post/AddPostForm'; 

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const HomeMain = () => {
  const { loading: feedLoading, feed } = useGetFeed();
  const { profile, loading: profileLoading } = useGetUserProfile(); 
  // console.log('profile of logged in user => ', profile);
  // console.log('profile user id => ', profile?._id)
  const location = useLocation(); 
  const [highlightedPost, setHighlightedPost] = useState(null);
  const [showAddPostModal, setShowAddPostModal] = useState(false); 
  const [isCreatingPost, setIsCreatingPost] = useState(false); 

  // console.log("profile => ", profile)

  const getPostIdFromQuery = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('postId');
  };

  useEffect(() => {
    const postId = getPostIdFromQuery();
    if (postId) {
      const fetchHighlightedPost = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/post/getPostDetails/${postId}`);
          const data = await res.json();
          if (res.ok && data.success) {
            setHighlightedPost(data.data);
          }
        } catch (error) {
          console.error('Error fetching the highlighted post:', error);
        }
      };

      fetchHighlightedPost();
    }
  }, [location]);

  return (
    <div className='flex'>
      {/* Sidebar */}
      <HomeSidebar onAddPostClick={() => setShowAddPostModal(true)} />

      {/* Main content including modal */}
      <div className='flex flex-row '>
        {/* Overlay Loader */}
        {isCreatingPost && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <ClipLoader size={50} color={"#fff"} />
          </div>
        )}

        {/* AddPostForm modal */}
        {showAddPostModal && (
          <AddPostForm 
            onClose={() => setShowAddPostModal(false)} 
            onPostCreate={(isCreating) => setIsCreatingPost(isCreating)} 
          />
        )}

        {/* Main content */}
        <div className='flex flex-col w-[800px] justify-center items-center relative ml-[300px]'>
          {/* Pass profilePic to HomeHeader */}
          <HomeHeader profilePic={profile?.images} userId= {profile?._id}/> 

          {/* Display the highlighted post if available */}
          {highlightedPost && (
            <PostBox post={highlightedPost} />
          )}

          {/* Display the regular feed */}
          {feedLoading || profileLoading ? (
            <div className="flex w-screen h-screen overflow-x-hidden justify-center items-center">
              <ClipLoader size={50} color={"#123abc"} />
            </div>
          ) : (
            Array.isArray(feed) && feed.length > 0 ? (
              feed.map((post, index) => (
                <PostBox key={index} post={post} />
              ))
            ) : (
              <p>No feed available</p>  
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeMain;
