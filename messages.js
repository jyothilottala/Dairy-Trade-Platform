const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all messages for the current user
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .populate('sender', 'name companyName')
        .populate('recipient', 'name companyName')
        .populate('product', 'name')
        .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unread messages count
router.get('/unread/count', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            isRead: false
        });
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get received messages
router.get('/received', auth, async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user._id })
            .populate('sender', 'name companyName country')
            .populate('recipient', 'name companyName country')
            .populate('product', 'name category price unit')
            .sort({ createdAt: -1 });
        
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get sent messages
router.get('/sent', auth, async (req, res) => {
    try {
        const messages = await Message.find({ sender: req.user._id })
            .populate('sender', 'name companyName country')
            .populate('recipient', 'name companyName country')
            .populate('product', 'name category price unit')
            .sort({ createdAt: -1 });
        
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/', 
    auth,
    [
        body('recipient').notEmpty().withMessage('Recipient is required'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('content').trim().notEmpty().withMessage('Content is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { recipient, subject, content, product } = req.body;
            
            const message = new Message({
                sender: req.user._id,
                recipient,
                subject,
                content,
                product
            });

            await message.save();
            res.status(201).json(message);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the recipient of this message
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark this message as read' });
        }

        message.isRead = true;
        await message.save();
        
        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is either the sender or recipient
        if (message.sender.toString() !== req.user._id.toString() && 
            message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await message.remove();
        res.json({ message: 'Message deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 