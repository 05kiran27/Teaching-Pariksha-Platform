const path = require('path');
const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const User = require('../models/User');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// exports.postComment = async (req, res) => {
//     try {
//         const { postId, body } = req.body;
//         const userId = req.user.id;

//         // Validate input
//         if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Valid post ID is required",
//             });
//         }

//         if (!body || body.trim() === "") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Please enter a comment",
//             });
//         }

//         // Fetch post details
//         const postDetails = await Post.findById(postId);
//         if (!postDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Post not found",
//             });
//         }

//         // Fetch user details
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found or not authorized",
//             });
//         }

//         // Create a new comment
//         const comment = await PostComment.create({
//             post: postDetails._id,
//             user: user._id, // Reference to the user
//             body,
//         });

//         // Add comment to post's comments list
//         postDetails.postComment.push(comment._id);
//         await postDetails.save();

//         const notification = await Notification.create({
//             recipient: postDetails.user,  
//             sender: userId, 
//             type: 'post_commented',
//             message: `${user.firstName} ${user.lastName} comment on your post.`,
//             referenceId: postDetails._id,
//             referenceModel: 'Post'
//         });

//         // Push the notification ID into the recipient's notification array
//         await User.findByIdAndUpdate(
//             postDetails.user,
//             { $push: { notification: notification._id } }, // Add the notification ID to the user's notification array
//             { new: true }
//         );

//         // Return response
//         return res.status(200).json({
//             success: true,
//             message: "Comment posted successfully",
//             comment,
//             user
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Error in posting comment",
//         });
//     }
// };

exports.postComment = async (req, res) => {
    try {
        const { postId, body } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: "Valid post ID is required",
            });
        }

        if (!body || body.trim() === "") {
            return res.status(403).json({
                success: false,
                message: "Please enter a comment",
            });
        }

        // Fetch post details
        const postDetails = await Post.findById(postId);
        if (!postDetails) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found or not authorized",
            });
        }

        // Create a new comment
        const comment = await PostComment.create({
            post: postDetails._id,
            user: user._id, // Reference to the user
            body,
        });

        // Add comment to post's comments list
        postDetails.postComment.push(comment._id);
        await postDetails.save();

        const notification = await Notification.create({
            recipient: postDetails.user,  
            sender: userId, 
            type: 'post_commented',
            message: `${user.firstName} ${user.lastName} commented on your post.`,
            referenceId: postDetails._id,
            referenceModel: 'Post'
        });

        // Push the notification ID into the recipient's notification array
        await User.findByIdAndUpdate(
            postDetails.user,
            { $push: { notification: notification._id } }, 
            { new: true }
        );

        // Populate the user field in the comment response
        const populatedComment = await comment.populate('user', 'firstName lastName');

        // Return response
        return res.status(200).json({
            success: true,
            message: "Comment posted successfully",
            comment: populatedComment, // Return populated comment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in posting comment",
        });
    }
};


exports.getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Valid post ID is required",
            });
        }

        // Fetch comments and populate user information
        const comments = await PostComment.find({ post: postId })
            .populate({
                    path:"user",
                    populate:{
                        path:"additionalDetails"
                    }
                }
            );

           

        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching comments"
        });
    }
};



exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const userId = req.user.id; // currently logged-in user

    if (!commentId) {
      return res.status(400).json({ success: false, message: "Comment ID required" });
    }

    const comment = await PostComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.accountType !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete comments" });
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.post, { $pull: { postComment: comment._id } });

    // Delete comment
    await PostComment.findByIdAndDelete(comment._id);

    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete comment", error: err.message });
  }
};
