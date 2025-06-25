// Check admin user in database
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user in database...');
    
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB || 'genedu');
    const collection = db.collection('users');
    
    // Check for admin users
    const adminUsers = await collection.find({ role: 'admin' }).toArray();
    console.log(`📊 Found ${adminUsers.length} admin users`);
    
    if (adminUsers.length > 0) {
      console.log('\n👑 Admin users:');
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.name || 'No name'} (${admin.email}) - ID: ${admin.userId}`);
      });
    } else {
      console.log('\n❌ No admin users found in database!');
      console.log('💡 Creating admin user...');
      
      const bcrypt = require('bcryptjs');
      const { randomUUID } = require('crypto');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = {
        userId: randomUUID(),
        name: 'Admin GenEdu',
        email: 'admin@genedu.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        status: 'active',
        createdAt: new Date(),
        lastLogin: null,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: false,
            quiz: true,
            notebook: true
          }
        },
        profileData: {
          bio: 'System Administrator',
          institution: 'GenEdu Platform',
          grade: '',
          subjects: [],
          timezone: 'UTC'
        },
        statistics: {
          notebooksCreated: 0,
          quizzesCompleted: 0,
          quizzesCreated: 0,
          totalStudyTime: 0,
          averageQuizScore: 0,
          streakDays: 0,
          lastActive: new Date()
        },
        subscription: {
          plan: 'admin',
          status: 'active',
          trialUsed: false
        }
      };
      
      const result = await collection.insertOne(adminUser);
      if (result.insertedId) {
        console.log('✅ Admin user created successfully!');
        console.log(`   - Email: admin@genedu.com`);
        console.log(`   - Password: admin123`);
        console.log(`   - User ID: ${adminUser.userId}`);
      } else {
        console.log('❌ Failed to create admin user');
      }
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUser();
