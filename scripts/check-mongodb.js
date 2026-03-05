#!/usr/bin/env node

/**
 * Check MongoDB connection and environment setup
 */

const { MongoClient } = require('mongodb');

async function checkConnection() {
  const uri = process.env.CHANGELOG_MONGODB_URI;

  console.log('\n🔍 MongoDB Connection Check\n');
  console.log('Environment Variables:');
  console.log('  CHANGELOG_MONGODB_URI:', uri || '❌ NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('');

  if (!uri) {
    console.error('❌ CHANGELOG_MONGODB_URI is not set in your environment');
    console.log('\n💡 Make sure .env.local exists and contains:');
    console.log('   CHANGELOG_MONGODB_URI=mongodb://localhost:27017/changelog-dev\n');
    process.exit(1);
  }

  console.log('📡 Attempting to connect to:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Found ${collections.length} collection(s) in database`);
    
    if (collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }

    await client.close();
    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Start it with:');
      console.log('   brew services start mongodb-community');
      console.log('   OR');
      console.log('   mongod --dbpath=/usr/local/var/mongodb\n');
    } else if (error.message.includes('Atlas')) {
      console.log('\n💡 It looks like you\'re trying to connect to MongoDB Atlas.');
      console.log('   For local development, update .env.local:');
      console.log('   CHANGELOG_MONGODB_URI=mongodb://localhost:27017/changelog-dev\n');
    }
    
    process.exit(1);
  }
}

checkConnection();
