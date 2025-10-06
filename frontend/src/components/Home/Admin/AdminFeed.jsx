import React, { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const AdminFeed = () => {
  const [posts, setPosts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch posts

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("dv-token");
      const res = await axios.get(`${BACKEND_URL}/api/v1/feed/getFeed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Feed API response:", res.data);

      // ✅ Get the array of posts safely
      const postsArray = Array.isArray(res.data?.data) ? res.data.data : [];

      // ✅ Sort pinned posts first, by pinnedRank
      const sorted = postsArray.sort((a, b) => {
        if (a.isPinned && b.isPinned) {
          return (a.pinnedRank || 0) - (b.pinnedRank || 0);
        } else if (a.isPinned) return -1;
        else if (b.isPinned) return 1;
        return 0;
      });

      setPosts(sorted);
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  // Toggle pin/boost
  const handleUpdateStatus = async (postId, field, value) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("dv-token");
      await axios.put(
        `${BACKEND_URL}/api/v1/post/updateStatus/${postId}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPosts();
      setMenuOpen(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Move pinned post up/down
  const handleMove = async (index, direction) => {
    const pinnedPosts = posts.filter((p) => p.isPinned);
    const nonPinnedPosts = posts.filter((p) => !p.isPinned);

    let moveIndex = index;
    let swapIndex = direction === "up" ? moveIndex - 1 : moveIndex + 1;

    if (swapIndex < 0 || swapIndex >= pinnedPosts.length) return;

    // Swap in array
    const newPinned = [...pinnedPosts];
    [newPinned[moveIndex], newPinned[swapIndex]] = [
      newPinned[swapIndex],
      newPinned[moveIndex],
    ];

    // Update rank for backend
    const rankedPinned = newPinned.map((p, i) => ({ postId: p._id, rank: i + 1 }));

    try {
      const token = localStorage.getItem("dv-token");
      await axios.put(
        `${BACKEND_URL}/api/v1/post/updatePinnedOrder`,
        { rankedPinned },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI
      setPosts([...newPinned, ...nonPinnedPosts]);
    } catch (error) {
      console.error("Error updating pinned order:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-6">Admin Feed Management</h2>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-3 rounded-lg shadow-md text-lg">
            Updating post...
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 w-full max-w-xl">
        {posts.map((post, index) => (
          <div
            key={post._id}
            className="bg-white rounded-xl shadow p-4 w-full flex relative"
          >
            {/* Rank arrows for pinned posts */}
            {post.isPinned && (
              <div className="flex flex-col gap-1 mr-4 justify-center items-center">
                <button
                  onClick={() => handleMove(posts.indexOf(post), "up")}
                  className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                >
                  <ArrowUp size={20} />
                </button>
                <button
                  onClick={() => handleMove(posts.indexOf(post), "down")}
                  className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                >
                  <ArrowDown size={20} />
                </button>
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 relative">
              {/* 3-dot menu */}
              <button
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                onClick={() =>
                  setMenuOpen(menuOpen === post._id ? null : post._id)
                }
              >
                <MoreVertical />
              </button>

              {menuOpen === post._id && (
                <div className="absolute right-3 top-10 bg-white border rounded-md shadow-lg z-50 w-40">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() =>
                      handleUpdateStatus(post._id, "isPinned", !post.isPinned)
                    }
                  >
                    {post.isPinned ? "Unpin Post" : "Pin Post"}
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() =>
                      handleUpdateStatus(post._id, "isBoosted", !post.isBoosted)
                    }
                  >
                    {post.isBoosted ? "Unboost Post" : "Boost Post"}
                  </button>
                </div>
              )}

              {/* Post content */}
              <img
                src={post.postImage}
                alt="post"
                className="w-full h-auto object-contain rounded-md mb-3"
              />
              <h3 className="text-lg font-semibold">{post.postTitle}</h3>
              <p className="text-gray-600">{post.postDescription}</p>
              <div className="mt-3 flex justify-between text-sm text-gray-500">
                <p>
                  {post.user.firstName} {post.user.lastName}
                </p>
                <div className="flex gap-3">
                  {post.isPinned && (
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">
                      📌 Pinned
                    </span>
                  )}
                  {post.isBoosted && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                      🚀 Boosted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeed;
