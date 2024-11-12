// backend/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: String,
    amountDT: Number,
    amountUSD: Number,
    receiverEmail: String,
    mediatorUsername: String,
    paymentReceipt: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'pending' },
    secondReceiverEmail: String,
    secondMediatorUsername: String,
    secondTransferReceipt: { type: String, required: false },
    transferringUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New field for transferring user
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
