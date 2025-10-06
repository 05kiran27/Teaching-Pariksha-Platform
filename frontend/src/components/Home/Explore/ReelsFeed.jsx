import { useCallback, useEffect, useRef, useState } from 'react';
import useExplorePosts from '../../../hooks/useExplorePosts';
import useGetComments from '../../../hooks/useGetComments';
import useLikePost from '../../../hooks/useLikePost';
import useShare from '../../../hooks/useShare';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaThumbsUp, FaRegCommentAlt, FaShare } from 'react-icons/fa';
import { FaThumbsUp as FaThumbsUpFilled } from 'react-icons/fa';  // Filled thumbs-up icon

const ReelsFeed = () => {
  const { posts, setPosts, loading, error, loadMorePosts } = useExplorePosts();
  const observer = useRef();
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showCommentSection, setShowCommentSection] = useState(false);

  // Refetch comments whenever post ID or comment section toggle changes
  const { comments, loading: commentsLoading, error: commentsError, addNewComment } = useGetComments(posts[currentPostIndex]?._id);

  const { likePost, loading: likeLoading, error: likeError } = useLikePost();
  const { sharePost, shareLoading } = useShare();

  // Infinite scroll logic
  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadMorePosts]);

  // Arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentPostIndex < posts.length - 1) {
        setCurrentPostIndex((prevIndex) => prevIndex + 1);
      } else if (e.key === 'ArrowUp' && currentPostIndex > 0) {
        setCurrentPostIndex((prevIndex) => prevIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPostIndex, posts.length]);

  const check = async() => {
    const userId = localStorage.getItem('userId');
    return posts[currentPostIndex]?.postLikes.includes(userId);
  }

  // Handle like action, update UI accordingly
  const handleLike = async () => {
    
    const postId = posts[currentPostIndex]._id;
    const post = posts[currentPostIndex];
    console.log('post => ', post);
    const userId = localStorage.getItem('userId'); // Assume the user ID is stored in localStorage
    console.log(posts[currentPostIndex]?.postLikes.includes(userId));

  
    try {
      const { userHasLiked } = await likePost(postId);
  
      // Create a new array with updated postLikes
      const updatedPosts = [...posts];
      updatedPosts[currentPostIndex] = {
        ...post,
        postLikes: userHasLiked
          ? [...post.postLikes, userId] // Add user to likes if liked
          : post.postLikes.filter(id => id !== userId), // Remove user from likes if unliked
      };
  
      // Update the posts state to reflect the change
      setPosts(updatedPosts); // <-- This updates the entire posts state
  
    } catch (error) {
      console.error('Error liking the post:', error);
      toast.error('Error liking the post');
    }
  };
  

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const postId = posts[currentPostIndex]._id;
      const token = localStorage.getItem('dv-token');

      const res = await axios.post(
        `https://dev-iu10.onrender.com/api/v1/comment/comment`,
        { postId, body: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const addedComment = res.data;
      addNewComment(addedComment.comment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error.response ? error.response.data : error.message);
      toast.error('Error adding comment');
    }
  };

  const handleShare = async () => {
    const postId = posts[currentPostIndex]._id;
    await sharePost(postId);
  };

  const toggleCommentSection = () => {
    setShowCommentSection((prev) => !prev);
  };

  const userId = localStorage.getItem('userId'); // Current user ID

  return (
    <div className="reels-container flex justify-center w-full h-screen overflow-hidden">
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading more posts...</p>}

      {posts.length > 0 && posts[currentPostIndex] && (
        <div key={posts[currentPostIndex]._id} className="reel-item w-[500px] h-screen flex flex-col items-center justify-center bg-black text-white">
          <div className="content flex flex-col items-center">
            {posts[currentPostIndex].postImage?.endsWith('.mp4') ? (
              <video src={posts[currentPostIndex].mediaUrl} className="max-w-full max-h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={posts[currentPostIndex]?.postImage} alt="Post media" className="max-w-full max-h-full object-cover" />
            )}

            <div className="mt-4 text-center">
              {posts[currentPostIndex]?.user && (
                <>
                  <p className="text-xl font-bold">{posts[currentPostIndex].user.firstName}</p>
                  <p className="text-sm text-gray-400">{posts[currentPostIndex]?.postDescription}</p>
                </>
              )}
            </div>

            <div className="actions flex space-x-4 mt-4">
              <button onClick={handleLike} disabled={likeLoading} className="flex items-center space-x-2">
                {check ? (
                  <FaThumbsUpFilled className="h-6 w-6 text-blue-500" />
                ) : (
                  <FaThumbsUp className="h-6 w-6 text-red-400" />
                )}
                <span>{likeLoading ? 'Liking...' : `${posts[currentPostIndex].postLikes.length} Likes`}</span>
              </button>

              <button onClick={toggleCommentSection} className="flex items-center space-x-2">
                <FaRegCommentAlt className="h-6 w-6 text-white" />
                <span>Comment</span>
              </button>

              <button onClick={handleShare} disabled={shareLoading} className="flex items-center space-x-2">
                <FaShare className="h-6 w-6 text-white" />
                <span>{shareLoading ? 'Sharing...' : 'Share'}</span>
              </button>
            </div>

            {showCommentSection && (
              <div className="comments mt-4 w-full px-4">
                <h4>Comments</h4>
                {commentsLoading && <p>Loading comments...</p>}
                {commentsError && <p className="text-red-500">{commentsError}</p>}
                {!commentsLoading && comments.length > 0 && (
                  <ul>
                    {comments.map((comment, index) => (
                      <li key={index} className="border-b border-gray-700 py-2">
                        <strong>{comment.user?.firstName || 'Anonymous'}:</strong> {comment.body}
                      </li>
                    ))} 
                  </ul>
                )}
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="mt-2 w-full text-black p-2 border border-gray-300 rounded"
                />
                <button onClick={handleCommentSubmit} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  {commentsLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {posts.length > 0 && currentPostIndex === posts.length - 1 && <div ref={lastPostRef}></div>}
    </div>
  );
};

export default ReelsFeed;
