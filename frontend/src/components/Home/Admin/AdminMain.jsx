import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const AdminMain = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [view, setView] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [quizView, setQuizView] = useState("list"); // 'list' or 'create'
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ✅
  const [showQuizDeleteModal, setShowQuizDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);




  // Likes + Comments modals
  const [selectedPostLikes, setSelectedPostLikes] = useState(null);
  const [likeUsers, setLikeUsers] = useState([]);
  const [selectedPostComments, setSelectedPostComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("dv-token");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostData, setEditPostData] = useState({
    _id: "",
    postTitle: "",
    postDescription: "",
    postImage: null,
  });



  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const usersRes = await axios.get(`${BACKEND_URL}/api/v1/user/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalUsers(usersRes.data.count);

        const postsRes = await axios.get(`${BACKEND_URL}/api/v1/post/posts/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalPosts(postsRes.data.count);

        const myPostsRes = await axios.get(`${BACKEND_URL}/api/v1/post/my-posts/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyPostsCount(myPostsRes.data.count);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };
    fetchCounts();
  }, [token]);

  // Fetch data by view
  const handleView = async (type) => {
    try {
      if (type === "users") {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/getAll-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
        setView("users");
      } else if (type === "posts") {
        const res = await axios.get(`${BACKEND_URL}/api/v1/post/admin/getPosts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.posts);
        setView("posts");
      } else if (type === "myPosts") {
        const res = await axios.get(`${BACKEND_URL}/api/v1/post/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyPosts(res.data.posts);
        setView("myPosts");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Delete logic
  const openDeleteModal = (userOrPost, type) => {
    if (type === "user") setSelectedUser(userOrPost);
    if (type === "post") setSelectedPost(userOrPost);
    setShowConfirmDelete(true);
    setMenuOpen(null);
  };

  const closeDeleteModal = () => {
    setShowConfirmDelete(false);
    setSelectedUser(null);
    setSelectedPost(null);
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;
      await axios.delete(`${BACKEND_URL}/api/v1/user/delete-user`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: selectedUser._id },
      });
      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const handleDeletePost = async () => {
    try {
      if (!selectedPost) return;
      await axios.delete(`${BACKEND_URL}/api/v1/post/deletePost`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { postId: selectedPost._id },
      });
      toast.success("Post deleted successfully");
      setPosts(posts.filter((p) => p._id !== selectedPost._id));
      setMyPosts(myPosts.filter((p) => p._id !== selectedPost._id));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/v1/quiz/delete/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Quiz deleted successfully!");
      // Remove the deleted quiz from state
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/comment/delete-comment`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commentId },
      });
      toast.success("Comment deleted successfully");
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setSelectedCommentId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // start loader
      const formData = new FormData();
      formData.append("postTitle", editPostData.postTitle);
      formData.append("postDescription", editPostData.postDescription);
      if (editPostData.postImage) formData.append("postImage", editPostData.postImage);

      const res = await axios.put(
        `${BACKEND_URL}/api/v1/post/edit/${editPostData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Post updated successfully");
        setShowEditModal(false);

        // Update the post in the state without reload
        setPosts((prev) =>
          prev.map((p) => (p._id === editPostData._id ? { ...p, ...res.data.data } : p))
        );

        setMyPosts((prev) =>
          prev.map((p) => (p._id === editPostData._id ? { ...p, ...res.data.data } : p))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post");
    } finally {
      setLoading(false); // stop loader
    }
  };




  // Likes + Comments fetch
  const fetchLikesUsers = (post) => {
    if (!post.postLikes || post.postLikes.length === 0) {
      setLikeUsers([]);
      return;
    }
    const users = post.postLikes.map((like) => like.user);
    setLikeUsers(users);
  };

  const fetchComments = (post) => {
    if (!post.postComment || post.postComment.length === 0) {
      setComments([]);
      return;
    }
    setComments(post.postComment);
  };

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/quiz/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data); // optional, for debugging
      setQuizzes(res.data.data); // <-- use 'data' key
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      toast.error("Failed to fetch quizzes");
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/v1/quiz/delete/${selectedQuiz._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Quiz deleted successfully!");
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
      setShowQuizDeleteModal(false);
      setSelectedQuiz(null);
    }
  };





  const toggleReadMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const renderMenu = (item, type) =>
  menuOpen === item._id && (
    <div className="absolute top-8 right-2 bg-white shadow-md border rounded-md z-20">
      {type === "post" && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditPostData({
                _id: item._id,
                postTitle: item.postTitle,
                postDescription: item.postDescription,
                postImage: null,
              });
              setShowEditModal(true);
              setMenuOpen(null);
            }}
            className="block px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-left"
          >
            Edit
          </button>
        </>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openDeleteModal(item, type);
        }}
        className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
      >
        Delete
      </button>
    </div>
  );


  const renderPostCard = (post) => (
    <div key={post._id} className="relative border rounded-lg p-4 shadow hover:shadow-lg transition">
      {/* 3 dots */}
      <div
        className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-gray-900 z-10"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(menuOpen === post._id ? null : post._id);
        }}
      >
        <FiMoreVertical size={20} />
      </div>
      {renderMenu(post, "post")}

      {post.user && (
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer"
          onClick={() => navigate(`/admin/user/${post.user._id}`)}
        >
          <img
            src={post.user.images || "/default-avatar.png"}
            alt={`${post.user.firstName} ${post.user.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm text-gray-500">
            {post.user.firstName} {post.user.lastName}
          </span>
        </div>
      )}

      {post.postImage && (
        <img
          src={post.postImage}
          alt={post.postTitle}
          className="w-full h-48 object-cover rounded mb-2"
        />
      )}

      <p className="font-bold text-lg mb-2">{post.postTitle}</p>

      <p className="text-gray-700 mb-2">
        {expandedPosts[post._id]
          ? post.postDescription
          : `${post.postDescription.slice(0, 100)}${
              post.postDescription.length > 100 ? "..." : ""
            }`}
        {post.postDescription.length > 100 && (
          <span
            className="text-blue-500 cursor-pointer ml-1"
            onClick={() => toggleReadMore(post._id)}
          >
            {expandedPosts[post._id] ? "Show less" : "Read more"}
          </span>
        )}
      </p>

      {/* Likes & Comments */}
      <div className="flex gap-6 text-gray-600">
        <button
          className="flex items-center gap-2 hover:text-blue-600"
          onClick={() => {
            setSelectedPostLikes(post._id);
            fetchLikesUsers(post);
          }}
        >
          <FaRegHeart /> {post.postLikes?.length || 0}
        </button>
        <button
          className="flex items-center gap-2 hover:text-green-600"
          onClick={() => {
            setSelectedPostComments(post._id);
            fetchComments(post);
          }}
        >
          <FaRegComment /> {post.postComment?.length || 0}
        </button>
      </div>
    </div>
  );


  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Summary Cards */}
      <div className="flex gap-6 mb-6">
        <div
          className="cursor-pointer bg-blue-500 text-white rounded-lg p-6 w-1/4 shadow-md hover:bg-blue-600"
          onClick={() => handleView("users")}
        >
          <p className="text-2xl font-bold">{totalUsers}</p>
          <p>Total Users</p>
        </div>

        <div
          className="cursor-pointer bg-green-500 text-white rounded-lg p-6 w-1/4 shadow-md hover:bg-green-600"
          onClick={() => handleView("posts")}
        >
          <p className="text-2xl font-bold">{totalPosts}</p>
          <p>Other's Posts</p>
        </div>

        <div
          className="cursor-pointer bg-purple-500 text-white rounded-lg p-6 w-1/4 shadow-md hover:bg-purple-600"
          onClick={() => handleView("myPosts")}
        >
          <p className="text-2xl font-bold">{myPostsCount}</p>
          <p>My Posts</p>
        </div>

        {/* 🆕 Feed section */}
        <div
          className="cursor-pointer bg-orange-500 text-white rounded-lg p-6 w-1/4 shadow-md hover:bg-orange-600"
          onClick={() => navigate("/admin/feed")}
        >
          <p className="text-2xl font-bold">Feed</p>
          <p>Manage Feeds</p>
        </div>

        {/* 🧠 Quiz section */}
        <div
          className="cursor-pointer bg-pink-500 text-white rounded-lg p-6 w-1/4 shadow-md hover:bg-pink-600 transition"
          onClick={async () => {
            await fetchQuizzes();
            setView("quiz");
            setQuizView("list"); // default to show all quizzes
          }}
        >
          <p className="text-2xl font-bold">Quiz</p>
          <p>Create or Manage Quizzes</p>
        </div>

      </div>

      {view === "quiz" && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quizzes</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin/quiz")}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create Quiz
              </button>

              

            </div>
          </div>

          {quizView === "create" && (
            <AdminQuizCreator /> // import this component at top
          )}

          {quizView === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="relative border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/admin/quiz/${quiz._id}`)}
                >
                  {/* 3 dots menu */}
                  <div
                    className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-gray-900 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === quiz._id ? null : quiz._id);
                    }}
                  >
                    <FiMoreVertical size={20} />
                  </div>
                  {menuOpen === quiz._id && (
                    <div className="absolute top-8 right-2 bg-white shadow-md border rounded-md z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/quiz/${quiz._id}`);
                          setMenuOpen(null);
                        }}
                        className="block px-4 py-2 text-blue-600 hover:bg-gray-100 w-full text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuiz(quiz); // store the clicked quiz
                          setShowQuizDeleteModal(true); // open modal
                          setMenuOpen(null);
                        }}
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Delete
                      </button>

                    </div>
                  )}

                  {/* Quiz creator */}
                  {quiz.createdBy && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={quiz.createdBy.images || "/default-avatar.png"}
                        alt={`${quiz.createdBy.firstName} ${quiz.createdBy.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">
                        {quiz.createdBy.firstName} {quiz.createdBy.lastName}
                      </span>
                    </div>
                  )}

                  {/* Quiz title and question count */}
                  <p className="font-bold text-lg">{quiz.title}</p>
                  <p className="text-gray-500 text-sm mt-1">{quiz.questions.length} questions</p>
                </div>
              ))}
            </div>
          )}


        </div>
      )}



      {/* Details Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {view === "users" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="relative border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col items-center text-center cursor-pointer"
                  onClick={() => navigate(`/admin/user/${user._id}`)}
                >
                  <div
                    className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-gray-900 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === user._id ? null : user._id);
                    }}
                  >
                    <FiMoreVertical size={20} />
                  </div>
                  {renderMenu(user, "user")}

                  <img
                    src={user.images || "/default-avatar.png"}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border mb-3"
                  />
                  <p className="font-bold text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-600">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                    {user.accountType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "posts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Other's Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(renderPostCard)}
            </div>
          </div>
        )}

        {view === "myPosts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map(renderPostCard)}
            </div>
          </div>
        )}

        {!view && <p className="text-gray-500">Click on a card above to view details</p>}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeDeleteModal}></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-1/3 text-center z-50">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-4">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={selectedUser ? handleDeleteUser : handleDeletePost}
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
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-50">
            <h2 className="text-xl font-bold mb-4">Liked by</h2>
            {likeUsers.length > 0 ? (
              <ul className="space-y-3">
                {likeUsers.map((u) =>
                  u ? (
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
                  ) : (
                    <li className="text-gray-400 italic">[Deleted User]</li>
                  )
                )}
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
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-50">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            {comments.length > 0 ? (
              <ul className="space-y-3">
                {comments.map((c) =>
                  c.user ? (
                    <li
                      key={c._id}
                      className="flex items-start justify-between gap-3 p-2 rounded hover:bg-gray-100"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(`/admin/user/${c.user._id}`)}
                      >
                        <img
                          src={c.user.images || "/default-avatar.png"}
                          alt={c.user.firstName}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {c.user.firstName} {c.user.lastName}
                          </p>
                          <p className="text-gray-600 text-sm">{c.body}</p>
                        </div>
                      </div>
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
                  ) : (
                    <li key={c._id} className="text-gray-400 italic">[Deleted User]</li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-50">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <form onSubmit={handleEditPost} className="flex flex-col gap-3">
              <input
                type="text"
                value={editPostData.postTitle}
                onChange={(e) => setEditPostData({ ...editPostData, postTitle: e.target.value })}
                placeholder="Post Title"
                className="border p-2 rounded"
              />
              <textarea
                value={editPostData.postDescription}
                onChange={(e) => setEditPostData({ ...editPostData, postDescription: e.target.value })}
                placeholder="Post Description"
                className="border p-2 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditPostData({ ...editPostData, postImage: e.target.files[0] })}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={loading} // disable cancel button while loading
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center"
                  disabled={loading} // disable submit while loading
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showQuizDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowQuizDeleteModal(false)}
          ></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-1/3 text-center z-50">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-4">
              Do you really want to delete the quiz "{selectedQuiz?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowQuizDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={confirmDeleteQuiz}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default AdminMain;
