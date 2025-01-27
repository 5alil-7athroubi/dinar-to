// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const os = require('os');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
// Configure CORS to allow all origins (for testing) or specific origins (for security)
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Register routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);       // Registering the /users route
// Default route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the DINAR Backend Server');
});
// MongoDB connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Dynamically determine host
function getLocalIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const iface of networkInterface) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const HOST = getLocalIP();
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
