require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  status: String,
  avatar: String,
  nim: String,
  nip: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      console.log('Admin user not found. Creating new admin...');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Create new admin
      await User.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        avatar: ''
      });

      console.log('\n✅ Admin user created successfully!');
    } else {
      console.log('Admin user found. Resetting to default credentials...');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Update admin
      admin.name = 'Administrator';
      admin.email = 'admin@example.com';
      admin.password = hashedPassword;
      admin.status = 'approved';

      // Save without triggering pre-save hook (direct update)
      await User.updateOne(
        { _id: admin._id },
        {
          $set: {
            name: 'Administrator',
            email: 'admin@example.com',
            password: hashedPassword,
            status: 'approved'
          }
        }
      );

      console.log('\n✅ Admin user reset successfully!');
    }

    console.log('\nAdmin Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Please change the admin password after login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
}

resetAdmin();
