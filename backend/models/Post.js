// backend/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: String,
    amountDT: Number,
    amountUSD: Number,
    receiverEmail: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'pending' },
    secondReceiverEmail: String,
    transferringUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New field for transferring user
    createdAt: { type: Date, default: Date.now },
    rejectionReason: { type: String },
    secondStatus: { type: String },
    secondRejectionReason: { type: String },
    secondCreatedAt: { type: Date },
});

module.exports = mongoose.model('Post', postSchema);
