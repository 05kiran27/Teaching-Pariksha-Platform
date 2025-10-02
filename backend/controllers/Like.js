const User = require('../models/User');
const Post = require('../models/Post');
const { post } = require('../routes/authRoute');
const PostLike = require('../models/PostLike')
const Notification = require('../models/Notification');


// Like Controller in Backend

exports.like = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user already liked this post
    let existingLike = await PostLike.findOne({ post: postId, user: userId });

    if (existingLike) {
      // User has liked: remove the like
      await PostLike.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { postLikes: existingLike._id } },
        { new: true }
      );

      // Optional: create notification for unlike
      const notification = await Notification.create({
        recipient: post.user,
        sender: userId,
        type: 'post_unliked',
        message: `${user.firstName} ${user.lastName} unliked your post.`,
        referenceId: post._id,
        referenceModel: 'Post'
      });

      await User.findByIdAndUpdate(
        post.user,
        { $push: { notification: notification._id } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Post unliked",
      });

    } else {
      // User has not liked: create a like
      const newLike = await PostLike.create({
        post: postId,
        user: userId,
      });

      await Post.findByIdAndUpdate(
        postId,
        { $push: { postLikes: newLike._id } },
        { new: true }
      );

      // Optional: create notification for like
      const notification = await Notification.create({
        recipient: post.user,
        sender: userId,
        type: 'post_liked',
        message: `${user.firstName} ${user.lastName} liked your post.`,
        referenceId: post._id,
        referenceModel: 'Post'
      });

      await User.findByIdAndUpdate(
        post.user,
        { $push: { notification: notification._id } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Post liked",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Cannot like/unlike the post, please try again later",
    });
  }
};

