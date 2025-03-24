const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all manufacturers
router.get('/manufacturers', async (req, res) => {
    try {
        const manufacturers = await User.find({ role: 'manufacturer' })
            .select('-password')
            .sort({ companyName: 1 });
        res.json(manufacturers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all importers
router.get('/importers', async (req, res) => {
    try {
        const importers = await User.find({ role: 'importer' })
            .select('-password')
            .sort({ companyName: 1 });
        res.json(importers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('products');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/:id',
    auth,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
        body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
        body('website').optional().isURL().withMessage('Invalid website URL'),
        body('description').optional().trim()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if user is updating their own profile
            if (req.params.id !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this profile' });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update allowed fields
            const allowedUpdates = ['name', 'companyName', 'phone', 'website', 'description', 'address'];
            allowedUpdates.forEach(update => {
                if (req.body[update] !== undefined) {
                    user[update] = req.body[update];
                }
            });

            await user.save();
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Update password
router.put('/:id/password',
    auth,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if user is updating their own password
            if (req.params.id !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this password' });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password
            const isMatch = await user.comparePassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Update password
            user.password = req.body.newPassword;
            await user.save();

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router; 