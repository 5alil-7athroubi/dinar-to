const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const os = require('os');
const path = require('path');  // Import the 'path' module
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

// Get the actual local IP assigned by WiFi
function getWiFiIP() {
    const networkInterfaces = os.networkInterfaces();
    let preferredIP = 'localhost';

    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168.100.')) {
                    return iface.address; // Prioritize WiFi IP
                }
                preferredIP = iface.address; // Fallback to the first available one
            }
        }
    }

    return preferredIP; // Return preferred IP if WiFi IP is not found
}

const HOST = getWiFiIP();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow specific origins dynamically
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:8080',   // Localhost
            `http://${HOST}:8080`,      // Dynamic local IP
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions)); // Apply custom CORS configuration
app.use(express.json());

// Register routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);  // Registering the /users route

// Default route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the DINAR Backend Server');
});

// MongoDB connection
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in the .env file");
    process.exit(1);
}

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Serve frontend static files (ensure frontend is built)
app.use(express.static(path.join(__dirname, 'frontend')));

// Default route to serve the frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

