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
// ✅ **Find User by Email**
router.get("/find", auth, async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email }).select("email place"); // Only return necessary fields
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
