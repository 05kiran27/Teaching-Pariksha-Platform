import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFollowContext } from '../context/FollowContext';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useFollow = (currentUserId, ownerId) => {
  const { followStatus, updateFollowStatus } = useFollowContext(); // Global follow status from context
  const [isChecking, setIsChecking] = useState(true); // Loading state for checking follow status
  const [error, setError] = useState(null);

  // Check if the follow status for this owner is already in the context
  const isFollowing = followStatus[ownerId] || false;

  // Fetch follow status when component mounts if not available in context
  useEffect(() => {
    if (!(ownerId in followStatus)) {
      const checkFollowStatus = async () => {
        setIsChecking(true);
        try {
          const response = await axios.get(`${BACKEND_URL}/api/v1/connect/user/${currentUserId}/isFollow/${ownerId}`);
          updateFollowStatus(ownerId, response.data.isFollowing); // Update context with follow status
        } catch (err) {
          setError(err.response ? err.response.data.message : 'An error occurred');
        } finally {
          setIsChecking(false);
        }
      };

      checkFollowStatus();
    } else {
      setIsChecking(false); // Already have status in context
    }
  }, [currentUserId, ownerId, followStatus, updateFollowStatus]);

  // Toggle follow/unfollow when button is clicked
  const toggleFollow = async () => {
    setError(null);
    setIsChecking(true);
    try {
      // Send follow/unfollow request
      const response = await axios.post(`${BACKEND_URL}/api/v1/connect/user/${currentUserId}/follow/${ownerId}`);
      updateFollowStatus(ownerId, !isFollowing); // Toggle status in context
      return response.data;
    } catch (err) {
      setError(err.response ? err.response.data.message : 'An error occurred');
    } finally {
      setIsChecking(false);
    }
  };

  return { isFollowing, isChecking, toggleFollow, error };
};

export default useFollow;
