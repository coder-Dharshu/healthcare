const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, age, gender, phone, bloodGroup } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = await User.create({
            name, email, password, role,
            dateOfBirth: age ? new Date(new Date().setFullYear(new Date().getFullYear() - age)) : undefined,
            gender, phone, bloodGroup
        });

        res.status(201).json({
            user,
            token: genToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({
            user,
            token: genToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
