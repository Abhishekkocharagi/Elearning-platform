const mongoose = require('mongoose');
const Category = require('../models/category');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error connecting to database:', error);
        process.exit(1);
    }
};

// Categories to add
const categories = [
    {
        name: "Web Development",
        description: "Learn to build modern web applications using HTML, CSS, JavaScript, React, Node.js and more"
    },
    {
        name: "Data Science",
        description: "Master data analysis, machine learning, Python, statistics and data visualization"
    },
    {
        name: "Mobile Development",
        description: "Build mobile apps for iOS and Android using React Native, Flutter, and native technologies"
    }
];

// Function to add categories
const addCategories = async () => {
    try {
        await connectDB();
        
        // Check if categories already exist
        const existingCategories = await Category.find({});
        console.log(`Found ${existingCategories.length} existing categories`);
        
        // Add categories
        for (const categoryData of categories) {
            // Check if category with same name already exists
            const existing = await Category.findOne({ name: categoryData.name });
            
            if (existing) {
                console.log(`Category "${categoryData.name}" already exists, skipping...`);
            } else {
                const category = await Category.create(categoryData);
                console.log(`✓ Added category: ${category.name}`);
            }
        }
        
        // Display all categories
        const allCategories = await Category.find({});
        console.log(`\nTotal categories in database: ${allCategories.length}`);
        allCategories.forEach(cat => {
            console.log(`  - ${cat.name}: ${cat.description}`);
        });
        
        console.log('\n✅ Categories added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding categories:', error);
        process.exit(1);
    }
};

// Run the script
addCategories();

