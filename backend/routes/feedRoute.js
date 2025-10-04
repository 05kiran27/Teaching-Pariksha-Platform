const express = require('express');
const router = express.Router();

const {postFeed, getExplore} = require('../controllers/Feed');
const { auth } = require('../middleware/auth');


router.get('/getFeed',auth, postFeed);
router.get('/explore', auth, getExplore);


module.exports = router;