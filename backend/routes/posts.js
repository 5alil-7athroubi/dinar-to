const express = require('express');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

// ✅ **Create a New Post**
router.post('/', auth, async (req, res) => {
    try {
        const { amountDT, amountUSD, receiverEmail } = req.body;
        const userId = req.user.userId;

        const newPost = new Post({
            content: `Post from ${userId}`,
            amountDT,
            amountUSD,
            receiverEmail,
            userId
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});

// ✅ **Fetch Transferable Posts (Hides Transferred Posts)**
router.get('/transferable', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.userId);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        // ✅ **Ensure users see posts only from different places**
        let requiredPlace = currentUser.place === "Out-Tunisia" ? "Tunisia" : "Out-Tunisia";

        const transferablePosts = await Post.find({
            status: 'approved',
            secondReceiverEmail: { $exists: false },
            transferringUserId: { $exists: false }
        })
        .populate({
            path: 'userId',
            select: 'username email place',
            match: { place: requiredPlace } // ✅ Only show posts from the required place
        })
        .lean();

        // ✅ Remove posts where userId is `null`
        const filteredPosts = transferablePosts.filter(post => post.userId !== null);

        res.json(filteredPosts);
    } catch (error) {
        console.error('Error fetching transferable posts:', error);
        res.status(500).json({ message: 'Error fetching transferable posts' });
    }
});

// ✅ **Handle Transfers & Update `status: null`**
router.post('/:postId/transfer', auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { secondReceiverEmail } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // 🔹 **Prevent overriding an existing transfer unless rejected**
        if (post.secondReceiverEmail || post.transferringUserId) {
            if (post.secondStatus !== "rejected") {
                return res.status(400).json({ message: "This post has already been transferred and cannot be changed." });
            }

            // ✅ **Reset transfer details if retrying after rejection**
            post.secondReceiverEmail = null;
            post.transferringUserId = null;
            post.secondStatus = "pending";
             post.secondCreatedAt = null; 
        }

        post.secondReceiverEmail = secondReceiverEmail;
        post.transferringUserId = req.user.userId;
        post.secondStatus = 'pending';
        post.secondCreatedAt = new Date(); 

        // ✅ **Set `status: null` when transfer is made**
        post.status = null;

        await post.save();
        res.status(200).json({ message: 'Transfer details saved successfully', post });
    } catch (error) {
        console.error('Error saving transfer details:', error);
        res.status(500).json({ message: 'Error saving transfer details' });
    }
});

// ✅ **Fetch Archived Data**
router.get('/archive', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { filter } = req.query;

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

        const posts = await Post.find(query)
            .populate('userId', 'username')
            .populate('transferringUserId', 'username')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching archive data:', error);
        res.status(500).json({ message: 'Error fetching archive data' });
    }
});

// ✅ **Cancel a Post (Clears Transfer Details)**
router.put('/:postId/cancel', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to cancel this post' });
        }

        // ✅ **Clear transfer details when cancelling**
        post.status = 'cancelled';
        post.secondReceiverEmail = null;
        post.transferringUserId = null;
        post.secondStatus = null;

        await post.save();

        res.status(200).json({ message: 'Post cancelled successfully', post });
    } catch (error) {
        console.error('Error cancelling post:', error);
        res.status(500).json({ message: 'Error cancelling post', error: error.message });
    }
});

module.exports = router;
