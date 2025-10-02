const express = require('express');
const router = express.Router();


const {auth, isAdmin, verifyToken} = require('../middleware/auth');
const {createPost, getPostDetails, updatePost, deletePost, getUserPost, getAdminPosts, getMyPostsCount} = require('../controllers/Post');
const {getAllPosts, getTotalPosts, getPostDetailsAdmin} = require('../controllers/Post')


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


module.exports = router;