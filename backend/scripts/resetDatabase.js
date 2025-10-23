require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Import models
const User = require('../models/User');
const Group = require('../models/Group');
const Discussion = require('../models/Discussion');
const Message = require('../models/Message');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const resetDatabase = async () => {
  try {
    console.log('\n=================================================');
    console.log('⚠️  DATABASE RESET SCRIPT ⚠️');
    console.log('=================================================\n');
    console.log('This script will DELETE ALL DATA from the database:');
    console.log('  - All Users (including admin)');
    console.log('  - All Groups');
    console.log('  - All Discussions');
    console.log('  - All Messages');
    console.log('  - All Uploaded Files\n');
    console.log('⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thynk');
    console.log('✅ Connected to MongoDB\n');

    // Get database name
    const dbName = mongoose.connection.name;
    console.log(`Database: ${dbName}\n`);

    // First confirmation
    const confirm1 = await question('Type "DELETE ALL DATA" to continue: ');
    if (confirm1 !== 'DELETE ALL DATA') {
      console.log('\n❌ Reset cancelled. No data was deleted.');
      process.exit(0);
    }

    // Second confirmation
    const confirm2 = await question('\nAre you absolutely sure? Type "YES" to confirm: ');
    if (confirm2 !== 'YES') {
      console.log('\n❌ Reset cancelled. No data was deleted.');
      process.exit(0);
    }

    console.log('\n🗑️  Starting database reset...\n');

    // Count documents before deletion
    const userCount = await User.countDocuments();
    const groupCount = await Group.countDocuments();
    const discussionCount = await Discussion.countDocuments();
    const messageCount = await Message.countDocuments();

    console.log('Current data:');
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Groups: ${groupCount}`);
    console.log(`  - Discussions: ${discussionCount}`);
    console.log(`  - Messages: ${messageCount}\n`);

    // Delete all data
    console.log('Deleting all users...');
    await User.deleteMany({});
    console.log('✅ All users deleted');

    console.log('Deleting all groups...');
    await Group.deleteMany({});
    console.log('✅ All groups deleted');

    console.log('Deleting all discussions...');
    await Discussion.deleteMany({});
    console.log('✅ All discussions deleted');

    console.log('Deleting all messages...');
    await Message.deleteMany({});
    console.log('✅ All messages deleted');

    console.log('\n=================================================');
    console.log('✅ DATABASE RESET COMPLETED');
    console.log('=================================================\n');
    console.log('All data has been deleted successfully.');
    console.log('\nNext steps:');
    console.log('1. Create a new admin account:');
    console.log('   node scripts/createAdmin.js');
    console.log('2. Start the application:');
    console.log('   npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
resetDatabase();
