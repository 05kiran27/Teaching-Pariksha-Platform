const express = require('express');
const router = express.Router();


const {auth} = require('../middleware/auth');
const {postComment, getCommentsForPost, deleteComment} = require('../controllers/Comment');


router.post('/comment', auth, postComment);
router.get('/comments/:postId',auth, getCommentsForPost);
router.delete('/delete-comment', auth, deleteComment);

module.exports = router;