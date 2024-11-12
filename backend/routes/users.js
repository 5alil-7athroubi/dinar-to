const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Route to get all users
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({}, 'username email place'); // Adjust fields as needed
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router;
