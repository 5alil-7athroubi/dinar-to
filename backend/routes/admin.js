const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Mediator = require('../models/Mediator');
const router = express.Router();

// Get pending posts with detailed info
router.get('/posts/pending', auth, adminOnly, async (req, res) => {
    try {
        const posts = await Post.find({ status: 'pending' })
            .populate('userId', 'username email place bankInfo') // User details
            .lean(); // Makes the documents plain objects

        // Fetch additional details for receiver and mediator
        for (const post of posts) {
            const receiver = await User.findOne({ email: post.receiverEmail });
            const mediator = await Mediator.findOne({ username: post.mediatorUsername });

            post.receiver = receiver;
            post.mediator = mediator;
        }

        res.json(posts);
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ message: 'Error fetching pending posts' });
    }
});
router.put('/posts/:postId', auth, adminOnly, async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            console.log(`Post with ID ${postId} not found`);
            return res.status(404).json({ message: 'Post not found' });
        }

        post.status = status;
        await post.save();

        console.log(`Post status updated to "${status}" for post ID ${postId}`);
        res.json({ message: `Post ${status} successfully` });
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({ message: 'Error updating post status', error: error.message });
    }
});

// Route to get all posts with pending transfers

router.get('/posts/transfers/pending', auth, adminOnly, async (req, res) => {
    try {
        // Find posts with 'transfer_pending' status and populate primary user info
        const posts = await Post.find({ status: 'transfer_pending' })
            .populate('userId', 'username email place bankInfo')
            .populate('transferringUserId', 'username email place bankInfo')
            .lean();

        for (const post of posts) {
            // Fetch and assign primary receiver details
            post.receiver = await User.findOne({ email: post.receiverEmail }).lean();
            
            // Fetch and assign primary mediator details
            post.mediator = await Mediator.findOne({ username: post.mediatorUsername }).lean();
            
            // Fetch and assign secondary receiver details
            post.secondReceiver = await User.findOne({ email: post.secondReceiverEmail }).lean();
            
            // Fetch and assign secondary mediator details
            post.secondMediator = await Mediator.findOne({ username: post.secondMediatorUsername }).lean();
        }

        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts with pending transfers:', error);
        res.status(500).json({ message: 'Error retrieving posts with pending transfers', error: error.message });
    }
});




// Route to update transfer status
router.put('/posts/:postId/transfer-status', auth, adminOnly, async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Update the status
        post.status = status;
        await post.save();

        res.status(200).json({ message: `Transfer ${status} successfully` });
    } catch (error) {
        console.error('Error updating transfer status:', error);
        res.status(500).json({ message: 'Error updating transfer status', error: error.message });
    }
});

// Add new mediator
router.post('/mediators', auth, adminOnly, async (req, res) => {
    try {
        const { username, email, place, bankInfo } = req.body;

        const newMediator = new Mediator({
            username,
            email,
            place,
            bankInfo
        });

        await newMediator.save();
        res.status(201).json({ message: 'Mediator added successfully' });
    } catch (error) {
        console.error('Error adding mediator:', error);
        res.status(500).json({ message: 'Error adding mediator', error: error.message });
    }
});
module.exports = router;
