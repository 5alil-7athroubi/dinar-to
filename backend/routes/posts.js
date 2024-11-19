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
        post.secondStatus = 'pending';

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
// Fetch archive data
router.get('/archive', auth, async (req, res) => {
    try {
        const userId = req.user.userId; // This should be user1's ID
        const { filter } = req.query;

        console.log('Logged-in User:', userId);
        console.log('Filter:', filter);

        let query = {};
        if (filter === 'pending') {
            query = {
                $or: [
                    { userId, status: 'pending' }, 
                    { transferringUserId: userId, secondStatus: 'pending' }
                ]
            };
        } else if (filter === 'post-approved') {
            query = { userId, status: 'approved' };
        } else if (filter === 'post-rejected') {
            query = { userId, status: 'rejected' };
        } else if (filter === 'transfer-approved') {
            query = { transferringUserId: userId, secondStatus: 'approved' };
        } else if (filter === 'transfer-rejected') {
            query = { transferringUserId: userId, secondStatus: 'rejected' };
        } else {
            query = {
                $or: [
                    { userId },
                    { transferringUserId: userId }
                ]
            };
        }

        console.log('Constructed Query:', query);

        const posts = await Post.find(query)
            .populate('userId', 'username')
            .populate('transferringUserId', 'username')
            .sort({ createdAt: -1 }) 
            .lean();

        console.log('Filtered Posts:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching archive data:', error);
        res.status(500).json({ message: 'Error fetching archive data' });
    }
});

router.put('/:postId/cancel', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the logged-in user is the creator of the post
        if (post.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to cancel this post' });
        }

        // Update the post status to 'cancelled'
        post.status = 'cancelled';
        await post.save();

        res.status(200).json({ message: 'Post cancelled successfully', post });
    } catch (error) {
        console.error('Error cancelling post:', error);
        res.status(500).json({ message: 'Error cancelling post', error: error.message });
    }
});



module.exports = router;
