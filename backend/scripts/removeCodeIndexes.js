const mongoose = require('mongoose');
require('dotenv').config();

const removeCodeIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // Remove code index from faculties collection
    console.log('\n=== Checking Faculties Collection ===');
    try {
      const facultyIndexes = await db.collection('faculties').indexes();
      console.log('Current Faculty Indexes:', JSON.stringify(facultyIndexes, null, 2));

      // Drop the code+university composite index
      await db.collection('faculties').dropIndex('code_1_university_1');
      console.log('✅ Dropped code_1_university_1 index from faculties collection');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index code_1_university_1 does not exist in faculties (already removed or never existed)');
      } else {
        console.error('❌ Error with faculties indexes:', error.message);
      }
    }

    // Remove code index from programs collection
    console.log('\n=== Checking Programs Collection ===');
    try {
      const programIndexes = await db.collection('programs').indexes();
      console.log('Current Program Indexes:', JSON.stringify(programIndexes, null, 2));

      // Drop the code+faculty composite index
      await db.collection('programs').dropIndex('code_1_faculty_1');
      console.log('✅ Dropped code_1_faculty_1 index from programs collection');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  Index code_1_faculty_1 does not exist in programs (already removed or never existed)');
      } else {
        console.error('❌ Error with programs indexes:', error.message);
      }
    }

    // Show final indexes
    console.log('\n=== Final Indexes ===');
    const finalFacultyIndexes = await db.collection('faculties').indexes();
    console.log('Faculty Indexes:', JSON.stringify(finalFacultyIndexes, null, 2));

    const finalProgramIndexes = await db.collection('programs').indexes();
    console.log('Program Indexes:', JSON.stringify(finalProgramIndexes, null, 2));

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now create multiple faculties for the same university.');
    console.log('You can now create multiple programs for the same faculty.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
};

// Run the migration
removeCodeIndexes();
