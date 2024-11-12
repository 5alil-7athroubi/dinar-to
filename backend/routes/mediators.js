const express = require('express');
const { auth } = require('../middleware/auth');
const Mediator = require('../models/Mediator');
const router = express.Router();

// Route to get all mediators
router.get('/', auth, async (req, res) => {
    try {
        const mediators = await Mediator.find({}, 'username place bankInfo'); // Adjust fields as needed
        res.json(mediators);
    } catch (error) {
        console.error('Error fetching mediators:', error);
        res.status(500).json({ message: 'Error fetching mediators' });
    }
});

// Route to get a specific mediator by username
router.get('/:username', auth, async (req, res) => {
    try {
        const mediator = await Mediator.findOne({ username: req.params.username });
        if (!mediator) {
            return res.status(404).json({ message: 'Mediator not found' });
        }
        res.json(mediator);
    } catch (error) {
        console.error('Error fetching mediator:', error);
        res.status(500).json({ message: 'Error fetching mediator' });
    }
});

module.exports = router;
