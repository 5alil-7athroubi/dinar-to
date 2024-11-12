// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const mediatorRoutes = require('./routes/mediators');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Register routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);       // Registering the /users route
app.use('/mediators', mediatorRoutes); // Registering the /mediators route

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
