const mongoose = require('mongoose');
require('dotenv').config();

const removeCodeFields = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // Remove code field from all faculties
    console.log('\n=== Removing code field from Faculties ===');
    const facultyResult = await db.collection('faculties').updateMany(
      { code: { $exists: true } },
      { $unset: { code: "" } }
    );
    console.log(`✅ Updated ${facultyResult.modifiedCount} faculties (removed code field)`);

    // Remove code field from all programs
    console.log('\n=== Removing code field from Programs ===');
    const programResult = await db.collection('programs').updateMany(
      { code: { $exists: true } },
      { $unset: { code: "" } }
    );
    console.log(`✅ Updated ${programResult.modifiedCount} programs (removed code field)`);

    // Show sample documents
    console.log('\n=== Sample Documents (after cleanup) ===');
    const sampleFaculty = await db.collection('faculties').findOne({});
    if (sampleFaculty) {
      console.log('Sample Faculty:', JSON.stringify(sampleFaculty, null, 2));
    }

    const sampleProgram = await db.collection('programs').findOne({});
    if (sampleProgram) {
      console.log('Sample Program:', JSON.stringify(sampleProgram, null, 2));
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log('All code fields have been removed from faculties and programs.');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
};

// Run the cleanup
removeCodeFields();
