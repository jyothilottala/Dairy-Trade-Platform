

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { category, manufacturer, country, minPrice, maxPrice, certification } = req.query;
        let query = {};

        // Apply filters
        if (category) query.category = category;
        if (manufacturer) query.manufacturer = manufacturer;
        if (certification) query.certifications = certification;
        if (minPrice || maxPrice) {
            query['price.amount'] = {};
            if (minPrice) query['price.amount'].$gte = Number(minPrice);
            if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
        }

        // If country is specified, find manufacturers in that country first
        if (country) {
            const manufacturers = await User.find({ country, role: 'manufacturer' });
            query.manufacturer = { $in: manufacturers.map(m => m._id) };
        }

        const products = await Product.find(query)
            .populate('manufacturer', 'name companyName country')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('manufacturer', 'name companyName country');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product (manufacturers only)
router.post('/',
    auth,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('category').isIn(['milk', 'cheese', 'yogurt', 'butter', 'ghee', 'whey', 'other'])
            .withMessage('Invalid category'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('price.amount').isNumeric().withMessage('Price must be a number'),
        body('minimumOrderQuantity').isNumeric().withMessage('Minimum order quantity must be a number'),
        body('unit').isIn(['kg', 'liters', 'pieces', 'containers']).withMessage('Invalid unit')
    ],
    async (req, res) => {
        try {
            // Check if user is a manufacturer
            if (req.user.role !== 'manufacturer') {
                return res.status(403).json({ message: 'Only manufacturers can create products' });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const product = new Product({
                ...req.body,
                manufacturer: req.user._id
            });

            await product.save();

            // Add product to manufacturer's products array
            await User.findByIdAndUpdate(
                req.user._id,
                { $push: { products: product._id } }
            );

            res.status(201).json(product);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Update product (manufacturers only)
router.put('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the manufacturer of this product
        if (product.manufacturer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Update product
        Object.assign(product, req.body);
        await product.save();

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product (manufacturers only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the manufacturer of this product
        if (product.manufacturer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        // Remove product from manufacturer's products array
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { products: product._id } }
        );

        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get products by manufacturer
router.get('/manufacturer/:id', async (req, res) => {
    try {
        const products = await Product.find({ manufacturer: req.params.id })
            .populate('manufacturer', 'name companyName country')
            .sort({ createdAt: -1 });
        
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
