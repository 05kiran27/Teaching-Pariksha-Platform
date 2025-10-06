
import { useState } from 'react';
import toast from 'react-hot-toast';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useLikePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const likePost = async (postId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('dv-token');

      const res = await fetch(`${BACKEND_URL}/api/v1/like/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to like/unlike the post');
      }

      setSuccess(true);
      toast.success(data.message);

      // Return the updated like status and count
      return { userHasLiked: data.userHasLiked, likeCount: data.likeCount };

    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'An error occurred while liking the post');
      return { userHasLiked: null, likeCount: null };
    } finally {
      setLoading(false);
    }
  };

  return { likePost, loading, error, success };
};

export default useLikePost;
