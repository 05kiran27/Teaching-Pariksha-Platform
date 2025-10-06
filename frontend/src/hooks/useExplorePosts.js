// // /hooks/useExplorePosts.js
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// const useExplorePosts = () => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasMore, setHasMore] = useState(true); // Whether there are more posts to load
//   const [page, setPage] = useState(1); // Pagination

//   // Fetch posts from the backend
//   useEffect(() => {
//     const fetchPosts = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/feed/explore?limit=10&page=${page}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
//           },
//         });

//         const fetchedPosts = response.data.data;

//         setPosts(prevPosts => [...prevPosts, ...fetchedPosts]); // Append new posts to the existing ones
//         setHasMore(fetchedPosts.length > 0); // Check if there are more posts to load
//       } catch (err) {
//         setError('Error fetching posts');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (hasMore) {
//       fetchPosts();
//     }
//   }, [page]); // Trigger the effect when `page` changes

//   // Function to load more posts when the user scrolls down
//   const loadMorePosts = () => {
//     if (!loading && hasMore) {
//       setPage(prevPage => prevPage + 1); // Increment the page to load more posts
//     }
//   };

//   return { posts, loading, error, loadMorePosts };
// };

// export default useExplorePosts;



import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useExplorePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true); // Whether there are more posts to load
  const [page, setPage] = useState(1); // Pagination

  // Fetch posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/feed/explore?limit=10&page=${page}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
          },
        });

        const fetchedPosts = response.data.data;

        setPosts(prevPosts => [...prevPosts, ...fetchedPosts]); // Append new posts to the existing ones
        setHasMore(fetchedPosts.length > 0); // Check if there are more posts to load
      } catch (err) {
        setError('Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    if (hasMore) {
      fetchPosts();
    }
  }, [page, hasMore]); // Trigger the effect when `page` or `hasMore` changes

  // Function to load more posts when the user scrolls down
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1); // Increment the page to load more posts
    }
  };

  // Return the necessary values, including setPosts for external manipulation
  return { posts, setPosts, loading, error, loadMorePosts };
};

export default useExplorePosts;
