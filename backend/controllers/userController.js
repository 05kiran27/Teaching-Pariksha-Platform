
const User = require('../models/User')
const Profile = require('../models/Profile');
const Post = require("../models/Post");
const PostLike = require("../models/PostLike");
const PostComment = require("../models/PostComment");


exports.getUserForSidebar = async (req,res) => {
    try{
        const loggedInUserId = req.user._id;
        const filterUser = await User.find({
            _id:{$ne:loggedInUserId}
        }).select("-password")

        return res.status(200).json(filterUser);

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"error in userController"
        })
    }
}

exports.getAllUsers = async (req, res) => {
  try {
    // Make sure only Admin can access
    if (req.user.accountType?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
    // Fetch all users except the currently logged-in admin
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    // Make sure only Admin can access
    if (req.user.accountType?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }

    // Count all users except the logged-in admin (optional)
    const count = await User.countDocuments({ _id: { $ne: req.user.id } });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete user (admin only)

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1️⃣ Remove likes made by this user
    await PostLike.deleteMany({ user: userId });

    // 2️⃣ Remove comments made by this user
    await PostComment.deleteMany({ user: userId });

    // 3️⃣ Remove this user's likes and comments from posts
    await Post.updateMany(
      {},
      {
        $pull: {
          postLikes: { user: userId }, // remove likes by this user
          postComment: { user: userId } // remove comments by this user
        }
      }
    );

    // 4️⃣ Finally, delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ success: true, message: "User and related data deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete user", error: err.message });
  }
};
