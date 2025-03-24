const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairy_connect';

const sampleManufacturers = [
  {
    name: "John Smith",
    email: "john@dairyfresh.com",
    password: "password123",
    role: "manufacturer",
    companyName: "DairyFresh Industries",
    country: "New Zealand",
    phone: "+64 21 123 4567",
    address: {
      street: "123 Dairy Lane",
      city: "Auckland",
      state: "Auckland Region",
      country: "New Zealand",
      postalCode: "1010"
    },
    website: "www.dairyfresh.com",
    description: "Premium dairy products from New Zealand's finest farms"
  },
  {
    name: "Maria Garcia",
    email: "maria@lacteos.com",
    password: "password123",
    role: "manufacturer",
    companyName: "Lacteos Deliciosos",
    country: "Spain",
    phone: "+34 91 234 5678",
    address: {
      street: "Calle Leche 45",
      city: "Madrid",
      state: "Madrid",
      country: "Spain",
      postalCode: "28001"
    },
    website: "www.lacteosdeliciosos.com",
    description: "Traditional Spanish dairy products"
  },
  {
    name: "Hans Mueller",
    email: "hans@alpinecheese.com",
    password: "password123",
    role: "manufacturer",
    companyName: "Alpine Cheese Co.",
    country: "Switzerland",
    phone: "+41 44 345 6789",
    address: {
      street: "Bergstrasse 78",
      city: "Zurich",
      state: "Zurich",
      country: "Switzerland",
      postalCode: "8001"
    },
    website: "www.alpinecheese.com",
    description: "Premium Swiss cheese and dairy products"
  }
];

const sampleProducts = [
  {
    name: "Premium Full Cream Milk",
    category: "milk",
    description: "High-quality full cream milk from grass-fed cows",
    specifications: {
      fatContent: "3.5%",
      proteinContent: "3.2%",
      shelfLife: "14 days"
    },
    price: {
      amount: 2.5,
      currency: "USD"
    },
    minimumOrderQuantity: 1000,
    unit: "liters",
    certifications: ["ISO", "HACCP", "Organic"],
    images: ["https://example.com/milk1.jpg"]
  },
  {
    name: "Aged Cheddar Cheese",
    category: "cheese",
    description: "Traditional aged cheddar with rich flavor",
    specifications: {
      age: "12 months",
      fatContent: "32%",
      proteinContent: "25%"
    },
    price: {
      amount: 12.99,
      currency: "USD"
    },
    minimumOrderQuantity: 100,
    unit: "kg",
    certifications: ["ISO", "HACCP", "Halal"],
    images: ["https://example.com/cheese1.jpg"]
  },
  {
    name: "Greek Yogurt",
    category: "yogurt",
    description: "Creamy Greek yogurt with high protein content",
    specifications: {
      fatContent: "10%",
      proteinContent: "8%",
      shelfLife: "21 days"
    },
    price: {
      amount: 4.99,
      currency: "USD"
    },
    minimumOrderQuantity: 500,
    unit: "kg",
    certifications: ["ISO", "HACCP", "Organic"],
    images: ["https://example.com/yogurt1.jpg"]
  },
  {
    name: "Premium Butter",
    category: "butter",
    description: "High-quality butter made from fresh cream",
    specifications: {
      fatContent: "82%",
      moistureContent: "16%",
      shelfLife: "6 months"
    },
    price: {
      amount: 8.99,
      currency: "USD"
    },
    minimumOrderQuantity: 200,
    unit: "kg",
    certifications: ["ISO", "HACCP", "Kosher"],
    images: ["https://example.com/butter1.jpg"]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create manufacturers
    const manufacturers = await Promise.all(
      sampleManufacturers.map(async (manufacturer) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(manufacturer.password, salt);
        return User.create({
          ...manufacturer,
          password: hashedPassword
        });
      })
    );
    console.log('Created manufacturers');

    // Create products for each manufacturer
    for (const manufacturer of manufacturers) {
      const manufacturerProducts = await Promise.all(
        sampleProducts.map(async (product) => {
          const createdProduct = await Product.create({
            ...product,
            manufacturer: manufacturer._id
          });
          return createdProduct;
        })
      );
      console.log(`Created ${manufacturerProducts.length} products for ${manufacturer.companyName}`);
      
      // Update manufacturer with product IDs
      await User.findByIdAndUpdate(
        manufacturer._id,
        { $push: { products: { $each: manufacturerProducts.map(p => p._id) } } }
      );
    }
    console.log('Created products');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 