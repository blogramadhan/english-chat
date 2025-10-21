require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      console.log('Email:', adminExists.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      status: 'approved' // Admin is auto-approved
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Please change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
