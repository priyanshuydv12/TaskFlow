const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

// Any logged-in user: users list for the "assign to" dropdown
router.get('/list', async (req, res) => {
  try {
    const users = await User.find().select('name email avatar').sort({ name: 1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Admin-only routes below
router.use(authorizeRoles('admin'));

router.route('/').get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
