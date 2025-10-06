// components/PostDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import useShare from '../../hooks/useShare'; // Import the useShare hook

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PostDetails = () => {
  const { postId } = useParams(); // Extract the postId from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sharePost, shareLink, loading: shareLoading, error: shareError } = useShare(); // Use the useShare hook
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch post details from the backend using the provided route
        const res = await fetch(`${BACKEND_URL}/api/v1/post/getPostDetails/${postId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch post');
        }

        setPost(data.data); // Access the nested 'data' object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleShare = async () => {
    await sharePost(postId); // Call sharePost to generate the shareable link
  };

  const handleViewInFeed = () => {
    // Redirect to the home page and pass the postId as state
    navigate('/', { state: { postId } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="post-detail-container">
      {/* Display the post title */}
      <h1>{post.postTitle}</h1>

      {/* Display the post description */}
      <p>{post.postDescription}</p>

      {/* Display the post image */}
      {post.postImage && (
        <img src={post.postImage} alt={post.postTitle} className="post-image" />
      )}

      {/* Display the author's name */}
      <div className="author-details">
        <p>Posted by: {post.user.firstName} {post.user.lastName}</p>
        {post.user.images && (
          <img src={post.user.images} alt={`${post.user.firstName} ${post.user.lastName}`} className="author-image" />
        )}
      </div>

      {/* Display the number of likes */}
      <p>{post.postLikes.length} Likes</p>

      {/* Display the number of comments */}
      <p>{post.postComment.length} Comments</p>

      {/* Share Button */}
      <button onClick={handleShare} className="share-button" disabled={shareLoading}>
        {shareLoading ? 'Sharing...' : 'Share Post'}
      </button>
      {shareError && <div className="error">Error: {shareError}</div>}
      {shareLink && (
        <div>
          <div className="share-link">Shareable Link: <a href={shareLink}>{shareLink}</a></div>
          {/* Button to view post in the feed */}
          <button onClick={handleViewInFeed} className="view-feed-button">
            View in Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
