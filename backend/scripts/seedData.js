require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    let admin = await User.findOne({ email: 'admin@example.com' });

    if (!admin) {
      // Create admin user
      admin = await User.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'approved'
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Check if sample lecturers exist
    const lecturerCount = await User.countDocuments({ role: 'dosen', status: 'approved' });

    if (lecturerCount === 0) {
      // Create sample lecturers
      const lecturers = [
        {
          name: 'Dr. John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          role: 'dosen',
          nip: '1234567890',
          status: 'approved'
        },
        {
          name: 'Dr. Jane Smith',
          email: 'jane.smith@example.com',
          password: 'password123',
          role: 'dosen',
          nip: '0987654321',
          status: 'approved'
        }
      ];

      for (const lecturerData of lecturers) {
        await User.create(lecturerData);
        console.log(`✅ Lecturer created: ${lecturerData.name}`);
        console.log(`   Email: ${lecturerData.email}`);
        console.log(`   Password: password123`);
      }
    } else {
      console.log(`ℹ️  ${lecturerCount} approved lecturer(s) already exist`);
    }

    // Create sample categories
    const categoryCount = await Category.countDocuments();

    if (categoryCount === 0) {
      const categories = [
        {
          name: 'Programming',
          description: 'Topics related to programming and software development',
          createdBy: admin._id,
          isActive: true
        },
        {
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
          createdBy: admin._id,
          isActive: true
        },
        {
          name: 'Database',
          description: 'Database design, SQL, and NoSQL topics',
          createdBy: admin._id,
          isActive: true
        },
        {
          name: 'Web Development',
          description: 'Frontend and backend web development topics',
          createdBy: admin._id,
          isActive: true
        }
      ];

      for (const categoryData of categories) {
        await Category.create(categoryData);
        console.log(`✅ Category created: ${categoryData.name}`);
      }
    } else {
      console.log(`ℹ️  ${categoryCount} categor(y/ies) already exist`);
    }

    console.log('\n✅ Seed data completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Login as admin: admin@example.com / admin123');
    console.log('2. Login as lecturer: john.doe@example.com / password123');
    console.log('3. Register as student and select a lecturer\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
