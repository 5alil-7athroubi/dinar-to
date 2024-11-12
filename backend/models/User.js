const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    place: { type: String, required: true },
    bankInfo: {
        paymentMethod: String,
        accountHolderName: String,
        bankName: String,
        accountNumber: String,
        phoneNumber: String,
        service: String,
        serviceAccountName: String,
        serviceEmail: String,
        currency: String
    }
});

module.exports = mongoose.model('User', userSchema);

