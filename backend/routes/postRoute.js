const express = require('express');
const router = express.Router();


const {auth, isAdmin, verifyToken} = require('../middleware/auth');
const {createPost, getPostDetails, updatePost, deletePost, getUserPost, getAdminPosts, getMyPostsCount} = require('../controllers/Post');
const {getAllPosts, getTotalPosts, getPostDetailsAdmin, editPost, updatePinnedOrder} = require('../controllers/Post')
const {updatePostStatus} = require('../controllers/Post')


router.post('/createPost',auth, createPost);
router.get('/getPostDetails/:postId', getPostDetails);
router.put('/updatePost',auth, updatePost);
router.delete('/deletePost', auth, deletePost);
router.get('getUserPost', auth, getUserPost );

router.get("/admin/getPosts", verifyToken, isAdmin, getAllPosts);
router.get('/posts/count', auth, getTotalPosts);
router.get('/my-posts', auth, getAdminPosts);
router.get('/my-posts/count', auth, getMyPostsCount);
router.get('/getPostDetailsAdmin/:postId', getPostDetailsAdmin);


// edit post 
router.put("/edit/:postId", auth, editPost);

// Admin: Pin or Boost post
router.put("/updateStatus/:postId", auth, updatePostStatus);

router.put("/updatePinnedOrder", auth, updatePinnedOrder);


module.exports = router;