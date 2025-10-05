const Post = require('../models/Post');

exports.postFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await Post.find()
      .populate("user", "firstName lastName images email accountType");

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts found",
      });
    }

    // Separate posts by priority
    const pinnedAndBoosted = posts
      .filter((p) => p.isPinned && p.isBoosted)
      .sort((a, b) => b.createdAt - a.createdAt);

    const onlyPinned = posts
      .filter((p) => p.isPinned && !p.isBoosted)
      .sort((a, b) => b.createdAt - a.createdAt);

    const onlyBoosted = posts
      .filter((p) => !p.isPinned && p.isBoosted)
      .sort((a, b) => b.createdAt - a.createdAt);

    const normalPosts = posts
      .filter((p) => !p.isPinned && !p.isBoosted)
      .sort((a, b) => b.createdAt - a.createdAt);

    // Combine in order of priority
    const sortedPosts = [
      ...pinnedAndBoosted,
      ...onlyPinned,
      ...onlyBoosted,
      ...normalPosts,
    ];

    // Add user like status
    const postsWithLikeStatus = sortedPosts.map((post) => ({
      ...post._doc,
      userHasLiked: post.postLikes.includes(userId),
    }));

    return res.status(200).json({
      success: true,
      message: "Feed fetched successfully",
      data: postsWithLikeStatus,
    });
  } catch (error) {
    console.error("Error in postFeed:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot get the feed",
      error: error.message,
    });
  }
};


exports.getExplore = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query; // Default limit to 10 posts

        // Aggregation pipeline to fetch posts in random order and join user data
        const posts = await Post.aggregate([
            { $sample: { size: parseInt(limit) } }, // Randomize posts using MongoDB's $sample
            {
                $lookup: {
                    from: 'users', // Collection name of users
                    localField: 'user', // Field in the Post model (the ObjectId reference to the user)
                    foreignField: '_id', // Field in the User model (the ObjectId field)
                    as: 'user', // The result will be stored in the `user` field
                },
            },
            {
                $unwind: '$user', // Deconstruct the user array to a single object
            },
            {
                $sort: { createdAt: -1 }, // Sort by createdAt descending
            },
            {
                $project: {
                    _id: 1,
                    caption: 1,
                    postImage: 1, // Add mediaUrl for video or image
                    createdAt: 1,
                    postLikes: 1,
                    userHasLiked: { $in: [userId, '$postLikes'] }, // Check if user has liked the post
                    'user.firstName': 1,
                    'user.images': 1, // Include user fields
                },
            },
        ]);

        if (!posts.length) {
            return res.status(404).json({
                success: false,
                message: 'No posts found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Posts fetched successfully',
            data: posts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot get the explore feed',
        });
    }
};


