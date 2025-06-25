// Simple test to validate API endpoints are working with MongoDB
require('dotenv').config();
console.log('🧪 Testing API Integration with MongoDB');

// Test just the database connection first
const { MongoClient } = require('mongodb');

async function testDatabaseConnection() {
  try {
    console.log('\n1️⃣ Testing MongoDB Connection...');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI environment variable not found');
      return;
    }
    console.log('🔗 Connecting to MongoDB Atlas...');
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    const db = client.db(process.env.MONGODB_DB || 'genedu');
    
    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Check knowledge base collection
    const knowledgeCollection = db.collection('knowledgebases');
    const knowledgeCount = await knowledgeCollection.countDocuments();
    console.log(`📚 Found ${knowledgeCount} knowledge entries in database`);
    
    // Sample user data
    if (userCount > 0) {
      const sampleUsers = await usersCollection.find({ role: { $ne: 'admin' } }).limit(3).toArray();
      console.log('\n👥 Sample users:');
      sampleUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    await client.close();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabaseConnection();
