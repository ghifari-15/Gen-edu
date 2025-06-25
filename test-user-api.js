const jwt = require('jsonwebtoken');

// Configuration
const BASE_URL = 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Create an admin token for testing
const adminToken = jwt.sign(
  {
    userId: 'admin-123',
    email: 'admin@genedu.com',
    role: 'admin'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('🔑 Generated admin token for testing');
console.log('Token:', adminToken.substring(0, 50) + '...');

async function testUserAPI() {
  try {
    console.log('\n📊 Testing User Management API\n');

    // Test 1: Get all users
    console.log('1️⃣ Testing GET /api/admin/users');
    const getUsersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const usersData = await getUsersResponse.json();
    console.log('Status:', getUsersResponse.status);
    console.log('Response:', JSON.stringify(usersData, null, 2));

    if (usersData.success && usersData.users) {
      console.log(`✅ Found ${usersData.users.length} users in database`);
    } else {
      console.log('❌ Failed to get users:', usersData.message);
    }

    // Test 2: Create a new user
    console.log('\n2️⃣ Testing POST /api/admin/users');
    const newUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpass123',
      role: 'student'
    };

    const createUserResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    const createData = await createUserResponse.json();
    console.log('Status:', createUserResponse.status);
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createData.success && createData.user) {
      console.log('✅ User created successfully');
      const userId = createData.user.userId;

      // Test 3: Update the user
      console.log('\n3️⃣ Testing PUT /api/admin/users/:id');
      const updateData = {
        name: 'Updated Test User',
        role: 'teacher'
      };

      const updateUserResponse = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateUserResponse.json();
      console.log('Status:', updateUserResponse.status);
      console.log('Response:', JSON.stringify(updateResult, null, 2));

      if (updateResult.success) {
        console.log('✅ User updated successfully');
      } else {
        console.log('❌ Failed to update user:', updateResult.message);
      }

      // Test 4: Delete the user
      console.log('\n4️⃣ Testing DELETE /api/admin/users/:id');
      const deleteUserResponse = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const deleteResult = await deleteUserResponse.json();
      console.log('Status:', deleteUserResponse.status);
      console.log('Response:', JSON.stringify(deleteResult, null, 2));

      if (deleteResult.success) {
        console.log('✅ User deleted successfully');
      } else {
        console.log('❌ Failed to delete user:', deleteResult.message);
      }
    } else {
      console.log('❌ Failed to create user:', createData.message);
    }

    console.log('\n🎉 User API testing completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testUserAPI();
