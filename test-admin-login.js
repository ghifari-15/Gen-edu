// Test admin login
console.log('🔐 Testing Admin Login...');

async function testAdminLogin() {
  try {
    // Test login
    console.log('\n1️⃣ Testing admin login...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@genedu.com',
        password: 'admin123'
      })
    });

    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Admin login successful!');
      
      // Get the token from cookie or response
      const token = loginData.token;
      console.log('Token:', token.substring(0, 50) + '...');
      
      // Test auth check
      console.log('\n2️⃣ Testing admin auth check...');
      const authResponse = await fetch('http://localhost:3002/api/auth/admin/me', {
        method: 'GET',
        headers: {
          'Cookie': `admin-token=${token}`
        }
      });
      
      console.log('Auth status:', authResponse.status);
      const authData = await authResponse.json();
      console.log('Auth response:', JSON.stringify(authData, null, 2));
      
      if (authData.success) {
        console.log('✅ Admin auth check successful!');
        console.log(`👑 Welcome ${authData.user.name} (${authData.user.email})`);
      } else {
        console.log('❌ Admin auth check failed');
      }
    } else {
      console.log('❌ Admin login failed:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminLogin();
