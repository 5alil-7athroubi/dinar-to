//backend/routes/auth.js 

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();


// Register and Login routes should use the controller methods
router.post('/register', register);
router.post('/login', login); // This will now call login from authController.js


router.get('/profile', auth, getProfile);  // For fetching the profile
router.put('/profile', auth, updateProfile);
module.exports = router;