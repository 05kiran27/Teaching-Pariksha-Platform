const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {auth} = require('../middleware/auth');
const {updateProfile, getProfile} = require('../controllers/Profile');
const {getAllUsers, getUserCount, deleteUser} = require('../controllers/userController')


router.post('/updateProfile',auth, updateProfile);
router.get('/get-profile/:userId',auth, getProfile);
router.get('/getAll-user', auth, getAllUsers);
router.get('/count', auth, getUserCount);
router.delete('/delete-user',auth, deleteUser);

// routes/user.js
router.post("/get-users", async (req, res) => {
  try {
    const { userIds } = req.body;
    const users = await User.find({ _id: { $in: userIds } })
      .select("firstName lastName images");
    console.log('like user -> ', users);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});


module.exports = router;