const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['milk', 'cheese', 'yogurt', 'butter', 'ghee', 'whey', 'other']
    },
    description: {
        type: String,
        required: true
    },
    specifications: {
        type: Map,
        of: String
    },
    manufacturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    minimumOrderQuantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'liters', 'pieces', 'containers']
    },
    certifications: [{
        type: String,
        enum: ['ISO', 'HACCP', 'Halal', 'Kosher', 'Organic', 'FSSAI']
    }],
    images: [{
        type: String // URLs to product images
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema); 