const Post = require('../models/Post');
const User = require('../models/User');
const uploadFileToCloudinary = require('../utils/fileUpload');
const postLike = require('../models/PostLike');

// exports.createPost = async (req,res) => {

//     try {
//         const { postTitle, postDescription } = req.body;
//         const thumbnail = req.files.thumbnailImage;

//         if(!postTitle || !postDescription){
//             return res.status(400).json({
//                 success:false,
//                 message:"All fields are required",
//             });
//         }

//         const userId = req.user.id;
//         const userDetails = await User.findById(userId);

//         if(!userDetails){
//             return res.status(404).json({
//                 success:false,
//                 message:"user not found, please login ",
//             });
//         }

//         if (userDetails.accountType !== "Admin") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Only admins are allowed to create posts",
//             });
//         }

//         const thumbnailImage = await uploadFileToCloudinary(thumbnail, process.env.FOLDER_NAME);

//         // create post with empty likes/comments
//         const newPost = await Post.create({
//             postTitle,
//             postDescription,
//             user: userDetails._id,
//             postImage: thumbnailImage.secure_url,
//             postLikes: [],
//             postComment: []
//         });

//         // push the post to user
//         await User.findByIdAndUpdate(
//             userDetails._id,
//             { $push: { post: newPost._id } },
//             { new: true }
//         );

//         return res.status(200).json({
//             success:true,
//             message:"post created successfully",
//             data:newPost,
//         });

//     } catch(error) {
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:'failed to create a post',
//             error: error.message,
//         });
//     }
// };


// for admin  // assuming you have this

exports.createPost = async (req, res) => {
  try {
    const { postTitle, postDescription } = req.body;
    const thumbnail = req.files?.thumbnailImage;

    // Validation
    if (!postTitle || !postDescription) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Get user details
    const userId = req.user.id;
    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found, please login",
      });
    }

    // Only Admin can create posts
    if (userDetails.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins are allowed to create posts",
      });
    }

    // Upload thumbnail
    let thumbnailImageUrl = "";
    if (thumbnail) {
      const uploaded = await uploadFileToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      thumbnailImageUrl = uploaded.secure_url;
    }

    // Create new Post with empty likes and comments
    const newPost = await Post.create({
      postTitle,
      postDescription,
      user: userDetails._id,
      postImage: thumbnailImageUrl,
      postLikes: [],   // empty array
      postComment: [], // empty array
    });

    // Add post reference to user
    await User.findByIdAndUpdate(
      userDetails._id,
      { $push: { post: newPost._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};



// update post
exports.getPostDetails = async (req,res) => {
    try{
        const postId = req.params.postId;

        // validation
        if(!postId){
            return res.status(404).json({
                success:false,
                message:"post id not found while getting Post Details"
            });
        }

        // geting post details
        const postDetails = await Post.findById(
            {_id:postId},
        ).populate(
            {
                path:"user",
                populate:{
                    path:"additionalDetails"
                }
            }
        )
        // .populate('postLike')
        // .populate('postComment')
        .exec();

        console.log('post details => ', postDetails);
    
        if(!postDetails){
            return res.status(404).json({
                success:false,
                message:"Post not found ",
            })
        }

        // return response
        return res.status(200).json({
            success:true,
            message:"post details fetched successfully",
            data:postDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"cannot get post , please try after some time",
        });
    }
};


// update post 
exports.updatePost = async (req,res) => {
    try{
        const {postId, postTitle="",postDescription=""  } = req.body;

        // validate data
        if(!postId || !postTitle || !postDescription ){
            return res.status(404).json({
                success:false,
                message:"all fields are required ",
            });
        };

        // get post
        const postDetails = await Post.findById(
            {_id:postId},
        ).exec();

        // if post not foud
        if(!postDetails){
            return res.status(404).json({
                success:false,
                message:"post not found",
            })
        };

        // fetch image
        image = req.files.postImage;
        console.log("post image => ", image);

        

        // get user id from post
        const postOwner = postDetails.user;
        console.log("post ke malik ki user id => ", postOwner);

        // get user id of user or viewer
        const viewerId = req.user.id;
        console.log('viewer id => ', viewerId);

        if(postOwner != viewerId){
            return res.status(400).json({
                success:false,
                message:"you are not alowed to update the post",
            });
        }

        // upload image to cloudinary
        cloudinaryImage = await uploadFileToCloudinary(image, process.env.FOLDER_NAME);
        
        postDetails.postTitle = postTitle;
        postDetails.postDescription = postDescription;
        postDetails.postImage = cloudinaryImage.secure_url;
        
        await postDetails.save();

        // return res
        return res.status(200).json({
            success:true,
            message:"Post updated successfully",
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error in deleting post, please try after some time",
        });
    }
};


// delete post 
exports.deletePost = async (req, res) => {
    try {
        // fetch post id
        const { postId } = req.body;

        const userId = req.user.id;
        const userRole = req.user.accountType; // assuming accountType is stored in JWT or req.user

        // validation
        if (!postId) {
            return res.status(404).json({
                success: false,
                message: "Post id not found"
            });
        }

        // check if post exists
        const postDetails = await Post.findById(postId);

        if (!postDetails) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // check post owner or admin
        const postOwner = postDetails.user.toString(); // convert to string
        if (postOwner !== userId && userRole.toLowerCase() !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this post",
            });
        }

        // delete the post
        await Post.findByIdAndDelete(postId);

        // remove post reference from user's posts array
        await User.findByIdAndUpdate(postOwner, { $pull: { post: postId } });

        // return response
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleting post, please try after some time",
        });
    }
};


exports.getUserPost = async (req,res) => {
    
    try{
        const { userId } = req.params;
        const user = User.findById({userId});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found while getting the all post of the user"
            })
        }

        const post = user.populate('post').exec();

        return res.status(200).json({
            success:true,
            message:"all post of the user fetch successfully ",
            post
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:`Internal server Error in getUser post`,
        })
    }
}



// Controller to fetch all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Exclude posts created by the logged-in user
    const posts = await Post.find({ user: { $ne: req.user._id } })
      .populate("user", "firstName lastName images email accountType") // ✅ post author
      .populate({
        path: "postLikes",
        populate: {
          path: "user",
          select: "firstName lastName images email", // ✅ user info in likes
        },
      })
      .populate({
        path: "postComment",
        populate: {
          path: "user",
          select: "firstName lastName images email", // ✅ user info in comments
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getTotalPosts = async (req, res) => {
  try {
    // Make sure only Admin can access
    if (req.user.accountType?.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Admins only" });
    }

    // Count posts where user is NOT the logged-in user
    const count = await Post.countDocuments({ user: { $ne: req.user.id } });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error getting total posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get posts of logged-in admin
exports.getAdminPosts = async (req, res) => {
  try {
    const adminId = req.user.id; // from auth middleware

    const posts = await Post.find({ user: adminId })
      .populate("user", "firstName lastName images email accountType") // ✅ post author
      .populate({
        path: "postLikes",
        populate: {
          path: "user",
          select: "firstName lastName images email", // ✅ like user info
        },
      })
      .populate({
        path: "postComment",
        populate: {
          path: "user",
          select: "firstName lastName images email", // ✅ comment user info
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Count posts of logged-in admin
exports.getMyPostsCount = async (req, res) => {
  try {
    const adminId = req.user.id; // comes from auth middleware
    const count = await Post.countDocuments({ user: adminId });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error counting admin posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getPostDetailsAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("user", "firstName lastName images") // post owner
      .populate({
        path: "postLikes",
        populate: { path: "user", select: "firstName lastName images" }
      })
      .populate({
        path: "postComment",
        populate: { path: "user", select: "firstName lastName images text" }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "post details fetched successfully",
      data: post,
    });
  } catch (err) {
    console.error("❌ Error in getPostDetails:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Edit Post Controller

exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { postTitle, postDescription } = req.body;
    const postImage = req.files?.postImage; // same as createPost

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check only admin
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    if (!userDetails || userDetails.accountType !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can edit posts" });
    }

    // Update fields
    if (postTitle) post.postTitle = postTitle;
    if (postDescription) post.postDescription = postDescription;

    // Upload new image if provided
    if (postImage) {
      const uploaded = await uploadFileToCloudinary(postImage, process.env.FOLDER_NAME);
      post.postImage = uploaded.secure_url;
    }

    await post.save();

    // 🔹 Populate user before sending
    const populatedPost = await Post.findById(post._id).populate("user");

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: populatedPost,
    });
  } catch (error) {
    console.error("Error editing post:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { isPinned, isBoosted } = req.body;
    const userId = req.user.id;

    // Ensure only admins can do this
    const user = await User.findById(userId);
    if (!user || user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can pin or boost posts",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Update pin or boost
    if (typeof isPinned !== "undefined") post.isPinned = isPinned;
    if (typeof isBoosted !== "undefined") post.isBoosted = isBoosted;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post status updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error updating post status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating post status",
    });
  }
};


// ✅ Update pinned post order (Admin only)
exports.updatePinnedOrder = async (req, res) => {
  try {
    const { rankedPinned } = req.body;
    const userId = req.user.id;

    // Check if admin
    const user = await User.findById(userId);
    if (!user || user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update pinned order",
      });
    }

    if (!Array.isArray(rankedPinned) || rankedPinned.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid pinned post data",
      });
    }

    // Update each pinned post’s rank
    for (const { postId, rank } of rankedPinned) {
      await Post.findByIdAndUpdate(postId, { pinnedRank: rank });
    }

    res.status(200).json({
      success: true,
      message: "Pinned order updated successfully",
    });
  } catch (error) {
    console.error("Error updating pinned order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pinned order",
      error: error.message,
    });
  }
};


