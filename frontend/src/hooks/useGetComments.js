
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useGetComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('dv-token');
        const res = await fetch(`${BACKEND_URL}/api/v1/comment/comments/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch comments');
        }
        setComments(data.data);
      } catch (error) {
        setError(error.message);
        toast.error(error.message || 'Error fetching comments');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Function to add a new comment directly to the state
  const addNewComment = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  return { comments, loading, error, addNewComment };
};

export default useGetComments;
