#!/usr/bin/env node

/**
 * ALL-IN-ONE MIGRATION SCRIPT
 *
 * This script fixes the "Failed to save faculty/program" issue by:
 * 1. Removing old unique indexes on 'code' field
 * 2. Removing 'code' field from existing documents
 *
 * Usage: node scripts/fixCodeIssue.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const fixCodeIssue = async () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   FIX: Faculty & Program Code Issue Migration         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('⚠️  WARNING: This will modify your database!');
  console.log('   - Remove unique indexes on code field');
  console.log('   - Remove code field from existing documents\n');

  const answer = await question('Do you want to continue? (yes/no): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Migration cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    console.log('\n📡 Connecting to MongoDB...');
    console.log(`   URI: ${process.env.MONGODB_URI?.substring(0, 30)}...`);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    const db = mongoose.connection.db;
    let hasErrors = false;

    // ============================================
    // STEP 1: Remove indexes from faculties
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Removing indexes from faculties');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const facultyIndexes = await db.collection('faculties').indexes();
      const hasCodeIndex = facultyIndexes.some(idx => idx.name === 'code_1_university_1');

      if (hasCodeIndex) {
        await db.collection('faculties').dropIndex('code_1_university_1');
        console.log('✅ Dropped index: code_1_university_1');
      } else {
        console.log('ℹ️  Index code_1_university_1 not found (already removed or never existed)');
      }
    } catch (error) {
      console.error('❌ Error removing faculty index:', error.message);
      hasErrors = true;
    }

    // ============================================
    // STEP 2: Remove indexes from programs
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Removing indexes from programs');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const programIndexes = await db.collection('programs').indexes();
      const hasCodeIndex = programIndexes.some(idx => idx.name === 'code_1_faculty_1');

      if (hasCodeIndex) {
        await db.collection('programs').dropIndex('code_1_faculty_1');
        console.log('✅ Dropped index: code_1_faculty_1');
      } else {
        console.log('ℹ️  Index code_1_faculty_1 not found (already removed or never existed)');
      }
    } catch (error) {
      console.error('❌ Error removing program index:', error.message);
      hasErrors = true;
    }

    // ============================================
    // STEP 3: Remove code field from faculties
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Removing code field from faculties');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const facultyResult = await db.collection('faculties').updateMany(
        { code: { $exists: true } },
        { $unset: { code: "" } }
      );
      console.log(`✅ Updated ${facultyResult.modifiedCount} faculties`);

      if (facultyResult.modifiedCount === 0) {
        console.log('ℹ️  No faculties with code field found');
      }
    } catch (error) {
      console.error('❌ Error removing faculty code fields:', error.message);
      hasErrors = true;
    }

    // ============================================
    // STEP 4: Remove code field from programs
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Removing code field from programs');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const programResult = await db.collection('programs').updateMany(
        { code: { $exists: true } },
        { $unset: { code: "" } }
      );
      console.log(`✅ Updated ${programResult.modifiedCount} programs`);

      if (programResult.modifiedCount === 0) {
        console.log('ℹ️  No programs with code field found');
      }
    } catch (error) {
      console.error('❌ Error removing program code fields:', error.message);
      hasErrors = true;
    }

    // ============================================
    // VERIFICATION
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const finalFacultyIndexes = await db.collection('faculties').indexes();
    const hasOldFacultyIndex = finalFacultyIndexes.some(idx => idx.name === 'code_1_university_1');

    const finalProgramIndexes = await db.collection('programs').indexes();
    const hasOldProgramIndex = finalProgramIndexes.some(idx => idx.name === 'code_1_faculty_1');

    console.log('\nFinal Indexes:');
    console.log(`  Faculties: ${finalFacultyIndexes.map(idx => idx.name).join(', ')}`);
    console.log(`  Programs:  ${finalProgramIndexes.map(idx => idx.name).join(', ')}`);

    console.log('\nIndex Check:');
    console.log(`  ✅ Faculty code index removed: ${!hasOldFacultyIndex ? 'YES' : 'NO (FAILED)'}`);
    console.log(`  ✅ Program code index removed: ${!hasOldProgramIndex ? 'YES' : 'NO (FAILED)'}`);

    // Sample documents
    const sampleFaculty = await db.collection('faculties').findOne({});
    const sampleProgram = await db.collection('programs').findOne({});

    console.log('\nSample Documents:');
    if (sampleFaculty) {
      console.log(`  Faculty has 'code' field: ${sampleFaculty.code !== undefined ? 'YES (FAILED)' : 'NO (OK)'}`);
    }
    if (sampleProgram) {
      console.log(`  Program has 'code' field: ${sampleProgram.code !== undefined ? 'YES (FAILED)' : 'NO (OK)'}`);
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    if (!hasErrors && !hasOldFacultyIndex && !hasOldProgramIndex) {
      console.log('║   ✅ MIGRATION COMPLETED SUCCESSFULLY!                 ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('\n✨ What to do next:');
      console.log('   1. Restart your backend server');
      console.log('   2. Login to Admin Dashboard');
      console.log('   3. Try creating multiple faculties with same university');
      console.log('   4. Try creating multiple programs with same faculty');
      console.log('   5. Everything should work now! 🎉\n');
    } else {
      console.log('║   ⚠️  MIGRATION COMPLETED WITH WARNINGS                ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('\n⚠️  Some issues were detected. Please:');
      console.log('   1. Check the error messages above');
      console.log('   2. Run the script again if needed');
      console.log('   3. Or manually fix via MongoDB shell\n');
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.\n');
    rl.close();
    process.exit(0);
  }
};

// Handle CTRL+C
process.on('SIGINT', async () => {
  console.log('\n\n❌ Migration interrupted by user.');
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the migration
fixCodeIssue();
