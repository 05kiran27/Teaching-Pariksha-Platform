// hooks/useShare.js
import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useShare = () => {
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sharePost = async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('dv-token');

      const res = await fetch(`${BACKEND_URL}/api/v1/share/share/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to get shareable link');
      }

      // Modify the link to include the postId as a query parameter and redirect to the home page
      const link = `${window.location.origin}/?postId=${postId}`;
      setShareLink(link); // Set the share link for display

      if (navigator.share) {
        // Use the Web Share API if supported
        await navigator.share({
          title: 'Check out this post!',
          url: link,
        });
      } else {
        // Fallback: Show the link to the user
        alert(`Share this link: ${link}`);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error sharing the post:', error);
    } finally {
      setLoading(false);
    }
  };

  return { sharePost, shareLink, loading, error };
};

export default useShare;
