// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwtHelper');
const bcrypt = require('bcrypt');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// Generate Token (Auth-related)
router.post('/auth/generate-token', (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ message: 'Email and role are required.' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'JWT_SECRET not defined in environment variables.' });
        }

        const token = generateToken(email, role, secret);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Super Admin can create Admin or User
router.post('/superadmin/create', verifyToken, authorize('superadmin'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            isAdmin: role === 'admin' || role === 'superadmin',
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received:', req.body);

    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});

// Admin can only create normal users
router.post('/admin/create', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: 'user', // Admins can only create normal users
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch all users (Admin or Superadmin only)
router.get('/all', verifyToken, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords for security
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.delete('/:email', verifyToken, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        // Find and delete the user by email
        const user = await User.findOneAndDelete({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});


module.exports = router;
