const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const router = express.Router();

// ✅ **Get Pending Posts with Detailed Info (No Mediators)**
router.get('/posts/pending', auth, adminOnly, async (req, res) => {
    try {
        const posts = await Post.find({ status: 'pending' })
            .populate('userId', 'username email place bankInfo')
            .select('amountDT amountUSD receiverEmail createdAt secondCreatedAt') // ✅ Ensures receiverEmail is included
            .lean();
        // ✅ Ensure `receiverEmail` exists for all posts
        posts.forEach(post => {
            post.receiverEmail = post.receiverEmail || "N/A";
        });
        // Fetch receivers in one query
        const receiverEmails = posts.map(post => post.receiverEmail).filter(email => email);
        const receivers = await User.find({ email: { $in: receiverEmails } }).lean();

        // Assign fetched receivers to posts
        posts.forEach(post => {
            post.receiver = receivers.find(r => r.email === post.receiverEmail) || null;
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ message: 'Error fetching pending posts' });
    }
});

// ✅ **Approve or Reject a Post**
router.put('/posts/:postId', auth, adminOnly, async (req, res) => {
    try {
        const { postId } = req.params;
        const { status, rejectionReason } = req.body;

        console.log('Received Data:', { status, rejectionReason });

        const post = await Post.findById(postId);
        if (!post) {
            console.log(`Post with ID ${postId} not found`);
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update status and optionally set rejection reason
        post.status = status;
        if (status === 'rejected' && rejectionReason) {
            post.rejectionReason = rejectionReason;
        }

        await post.save();

        console.log(`Post status updated to "${status}" for post ID ${postId}`);
        res.json({ message: `Post ${status} successfully`, post });
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({ message: 'Error updating post status', error: error.message });
    }
});

// ✅ **Get All Posts with Pending Transfers**
router.get('/posts/transfers/pending', auth, adminOnly, async (req, res) => {
    try {
        // Find posts with 'transfer_pending' status and populate user info
        const posts = await Post.find({ secondStatus: 'pending' })
            .populate('userId', 'username email place bankInfo')
            .populate('transferringUserId', 'username email place bankInfo')
            .select('amountDT amountUSD receiverEmail secondReceiverEmail createdAt secondCreatedAt') // ✅ Ensure emails are included
            .lean();

        // Fetch receivers in one query
        const receiverEmails = posts.map(post => post.receiverEmail).filter(email => email);
        const secondReceiverEmails = posts.map(post => post.secondReceiverEmail).filter(email => email);
        const allReceiverEmails = [...new Set([...receiverEmails, ...secondReceiverEmails])]; // Remove duplicates
        const receivers = await User.find({ email: { $in: allReceiverEmails } }).lean();

        // Assign fetched receivers to posts
        posts.forEach(post => {
            post.receiver = receivers.find(r => r.email === post.receiverEmail) || null;
            post.secondReceiver = receivers.find(r => r.email === post.secondReceiverEmail) || null;
        });

        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts with pending transfers:', error);
        res.status(500).json({ message: 'Error retrieving posts with pending transfers', error: error.message });
    }
});

// ✅ **Update Transfer Status**
router.put('/posts/:postId/transfer-status', auth, adminOnly, async (req, res) => {
    try {
        const { postId } = req.params;
        const { secondStatus, secondRejectionReason } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Update the second status
        post.secondStatus = secondStatus;
        post.secondRejectionReason = secondRejectionReason || null; // ✅ Prevents undefined errors
        await post.save();

        res.status(200).json({ message: `Transfer ${secondStatus} successfully` });
    } catch (error) {
        console.error('Error updating transfer status:', error);
        res.status(500).json({ message: 'Error updating transfer status', error: error.message });
    }
});

module.exports = router;
