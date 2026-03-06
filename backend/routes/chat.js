const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET message history for a room (appointmentId)
router.get('/:appointmentId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.appointmentId })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
