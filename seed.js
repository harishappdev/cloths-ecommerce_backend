const mongoose = require('mongoose');
const Product = require('./src/models/productModel');
const Category = require('./src/models/categoryModel');
const User = require('./src/models/userModel');
require('dotenv').config();

const categories = [
    { name: 'Menswear' },
    { name: 'Womenswear' },
    { name: 'Accessories' },
    { name: 'Knitwear' },
    { name: 'Outerwear' }
];

const products = [
    {
        name: 'Urban Oversized Hoodie',
        description: 'Premium heavy-weight cotton hoodie with a relaxed fit. Perfect for street style.',
        price: 59.99,
        category: 'Menswear',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
        ratings: 4.8
    },
    {
        name: 'Silk Flowing Dress',
        description: 'Elegant silk dress with a floral pattern. Ideal for summer evenings.',
        price: 89.99,
        category: 'Womenswear',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1539008835270-3023773199a3?auto=format&fit=crop&q=80&w=800'],
        ratings: 4.9
    },
    {
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket with vintage wash. A versatile staple for any wardrobe.',
        price: 74.99,
        category: 'Menswear',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&q=80&w=800'],
        ratings: 4.7
    },
    {
        name: 'Leather Weekend Bag',
        description: 'Spacious genuine leather bag for short trips. Handcrafted for durability.',
        price: 129.99,
        category: 'Accessories',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800'],
        ratings: 4.6
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing_store');
        console.log('✅ Connected to MongoDB');

        // 1) Find an admin user to associate with products
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ No admin user found. Please sign up an admin first.');
            process.exit(1);
        }

        // 2) Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️  Existing products and categories cleared');

        // 3) Create Categories
        await Category.insertMany(categories);
        console.log('✅ Categories seeded');

        // 4) Create Products
        const productsWithAdmin = products.map(p => ({ ...p, createdBy: admin._id }));
        await Product.insertMany(productsWithAdmin);
        console.log('✅ Products seeded');

        console.log('🚀 Database Seeding Completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
