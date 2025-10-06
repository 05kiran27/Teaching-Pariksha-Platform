
import { useState } from 'react';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useAddComment = () => {
  const [loading, setLoading] = useState(false);

  const addComment = async (postId, commentBody) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dv-token');
      const response = await fetch('${BACKEND_URL}/api/v1/comment/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, body: commentBody }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }

      toast.success('Comment added successfully');
      return data.comment; // Return the new comment to update the UI
    } catch (error) {
      toast.error(error.message || 'An error occurred while adding the comment');
    } finally {
      setLoading(false);
    }
  };

  return { addComment, loading };
};

export default useAddComment;
