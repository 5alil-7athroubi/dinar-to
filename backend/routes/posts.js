const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

// Set up storage for uploaded files (Ensure this code block is not duplicated)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure the "uploads" directory exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Create new post with file upload
router.post('/', auth, upload.single('paymentReceipt'), async (req, res) => {
    try {
        const { amountDT, amountUSD, receiverEmail, mediatorUsername } = req.body;
        const userId = req.user.userId;

        const newPost = new Post({
            content: `Post from ${userId}`, // Placeholder content; modify as needed
            amountDT,
            amountUSD,
            receiverEmail,
            mediatorUsername,
            userId,
            paymentReceipt: req.file ? req.file.path : null // Save file path if uploaded
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});

// Fetch transferable posts (other users, different place, approved status)
router.get('/transferable', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.userId);
        console.log('Current User:', currentUser);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const transferablePosts = await Post.find({
            userId: { $ne: currentUser._id },   // Not the current user
            status: 'approved'
        })
        .populate('userId', 'username email place') // Get post creator details
        .lean();
        console.log('Transferable Posts Before Filtering:', transferablePosts);

        // Filter posts by place
        const filteredPosts = transferablePosts.filter(post => post.userId.place !== currentUser.place);
        console.log('Filtered Posts:', filteredPosts);
        res.json(filteredPosts);
    } catch (error) {
        console.error('Error fetching transferable posts:', error);
        res.status(500).json({ message: 'Error fetching transferable posts' });
    }
});

// posts.js (or the relevant route file)
router.post('/:postId/transfer', auth, upload.single('transferReceipt'), async (req, res) => {
    try {
        const { postId } = req.params;
        const { secondReceiverEmail, secondMediatorUsername } = req.body;

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Update transfer-related fields
        post.secondReceiverEmail = secondReceiverEmail;
        post.secondMediatorUsername = secondMediatorUsername;
        post.transferringUserId = req.user.userId; // Ensure transferringUserId is saved
        post.status = 'transfer_pending';

        // Save the receipt if uploaded
        if (req.file) {
            post.secondTransferReceipt = req.file.path;
        }

        // Save the post with updates
        await post.save();
        res.status(200).json({ message: 'Transfer details saved successfully', post });
    } catch (error) {
        console.error('Error saving transfer details:', error);
        res.status(500).json({ message: 'Error saving transfer details' });
    }
});

module.exports = router;
