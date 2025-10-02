import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMoreVertical } from "react-icons/fi";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Likes modal
  const [selectedPostLikes, setSelectedPostLikes] = useState(null);
  const [likeUsers, setLikeUsers] = useState([]);

  // Comments modal
  const [selectedPostComments, setSelectedPostComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const token = localStorage.getItem("dv-token");

  // Fetch user profile & posts
  useEffect(() => {
  const fetchUserAndPosts = async () => {
    try {
      // Reset state
      setUser(null);
      setUserPosts([]);
      setSelectedPostLikes(null);
      setLikeUsers([]);
      setSelectedPostComments(null);
      setComments([]);

      // Fetch user profile
      const res = await axios.get(
        `http://localhost:4000/api/v1/user/get-profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userData = res.data.user;
      setUser(userData);

      // If user has posts
      if (userData.post && userData.post.length > 0) {
        const postsPromises = userData.post.map((post) => {
          const postId = post._id || post; // use _id if object, otherwise treat as ID
          return axios
            .get(
              `http://localhost:4000/api/v1/post/getPostDetailsAdmin/${postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => res.data.data);
        });

        const posts = await Promise.all(postsPromises);
        setUserPosts(posts);
      }
    } catch (err) {
      console.error("Error fetching user or posts:", err);
      toast.error("Failed to fetch user or posts");
    }
  };

  fetchUserAndPosts();
}, [userId, token]);
 // dependency on userId ensures it refetches



  // Delete user
  const handleDeleteUser = async () => {
    try {
      await axios.delete("http://localhost:4000/api/v1/user/delete-user", {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });
      toast.success("User deleted successfully");
      navigate("/admin");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }
  };

  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete("http://localhost:4000/api/v1/comment/delete-comment", {
        headers: { Authorization: `Bearer ${token}` },
        data: { commentId },
      });

      toast.success("Comment deleted successfully");
      // Remove deleted comment from state
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setSelectedCommentId(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Failed to delete comment");
    }
  };


  // Fetch likes users (already included in post data)
  const fetchLikesUsers = (post) => {
    if (!post.postLikes || post.postLikes.length === 0) {
      setLikeUsers([]);
      return;
    }
    const users = post.postLikes.map((like) => like.user);
    setLikeUsers(users);
  };

  // Fetch comments of a post (from post data directly)
  const fetchComments = (post) => {
    if (!post.postComment || post.postComment.length === 0) {
      setComments([]);
      return;
    }
    setComments(post.postComment);
  };

  if (!user) return <p className="p-6 text-center">Loading user profile...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="relative bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        {/* 3 Dots Menu */}
        <div
          className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <FiMoreVertical size={22} />
        </div>

        {showMenu && (
          <div className="absolute top-12 right-4 bg-white border rounded-lg shadow-lg z-50">
            <button
              className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
              onClick={() => {
                setShowConfirmDelete(true);
                setShowMenu(false);
              }}
            >
              Delete User
            </button>
          </div>
        )}

        {/* User Header */}
        <div className="flex items-center gap-6 border-b pb-6 mb-6">
          <img
            src={user.images || "/default-avatar.png"}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
              {user.accountType}
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <p className="text-gray-700">
            {user.additionalDetails?.about || "No bio available."}
          </p>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="font-semibold text-gray-800">Date of Birth</p>
            <p className="text-gray-600">
              {user.additionalDetails?.dateOfBirth || "Not provided"}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="font-semibold text-gray-800">Gender</p>
            <p className="text-gray-600">
              {user.additionalDetails?.gender || "Not provided"}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="font-semibold text-gray-800">Contact Number</p>
            <p className="text-gray-600">
              {user.additionalDetails?.contactNumber || "Not provided"}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="font-semibold text-gray-800">Joined On</p>
            <p className="text-gray-600">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {userPosts.length}
            </p>
            <p className="text-gray-600 text-sm">Posts</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {user.followers?.length || 0}
            </p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">
              {user.following?.length || 0}
            </p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">
              {user.connection?.length || 0}
            </p>
            <p className="text-gray-600 text-sm">Connections</p>
          </div>
        </div>

        {/* User Posts */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Posts</h3>
          {userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map((p) => (
                <div
                  key={p._id}
                  className="border rounded-lg shadow p-4 bg-white"
                >
                  {p.postImage && (
                    <img
                      src={p.postImage}
                      alt={p.postTitle}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <h4 className="font-bold text-lg mb-2">{p.postTitle}</h4>
                  <p className="text-gray-700 mb-3">{p.postDescription}</p>
                  <div className="flex gap-6 text-gray-600">
                    <button
                      className="flex items-center gap-2 hover:text-blue-600"
                      onClick={() => {
                        setSelectedPostLikes(p._id);
                        fetchLikesUsers(p);
                      }}
                    >
                      <FaRegHeart /> {p.postLikes?.length || 0}
                    </button>
                    <button
                      className="flex items-center gap-2 hover:text-green-600"
                      onClick={() => {
                        setSelectedPostComments(p._id);
                        fetchComments(p);
                      }}
                    >
                      <FaRegComment /> {p.postComment?.length || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowConfirmDelete(false)}
          ></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 text-center z-50">
            <h2 className="text-xl font-bold mb-4">Delete User?</h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {selectedPostLikes && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setSelectedPostLikes(null);
              setLikeUsers([]);
            }}
          ></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-50">
            <h2 className="text-xl font-bold mb-4">Liked by</h2>
            {likeUsers.length > 0 ? (
              <ul className="space-y-3">
                {likeUsers.map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/admin/user/${u._id}`)}
                  >
                    <img
                      src={u.images || "/default-avatar.png"}
                      alt={u.firstName}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <span className="text-gray-800 font-medium">
                      {u.firstName} {u.lastName}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No likes yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPostComments && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setSelectedPostComments(null);
              setComments([]);
            }}
          ></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-50">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c._id} className="flex items-start justify-between gap-3 p-2 rounded hover:bg-gray-100">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/admin/user/${c.user._id}`)}>
                      <img
                        src={c.user?.images || "/default-avatar.png"}
                        alt={c.user?.firstName}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {c.user?.firstName} {c.user?.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">{c.body}</p>
                      </div>
                    </div>

                    {/* 3 Dots Menu */}
                    <div className="relative">
                      <button onClick={() => setSelectedCommentId(c._id)}>
                        <FiMoreVertical />
                      </button>
                      {selectedCommentId === c._id && (
                        <div className="absolute right-0 top-6 bg-white border rounded shadow-lg z-50">
                          <button
                            className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                            onClick={() => handleDeleteComment(c._id)}
                          >
                            Delete 
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
