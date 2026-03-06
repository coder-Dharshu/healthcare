const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// TODO: Implement dashboard stats route
router.get('/stats', protect, (req, res) => {
    res.json({ message: "Dashboard stats placeholder" });
});

module.exports = router;
