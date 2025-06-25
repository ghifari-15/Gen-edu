// Debug Admin Auth Flow
console.log('🔐 Testing Admin Authentication Flow...')

async function testAdminAuthFlow() {
  try {
    // Step 1: Test login
    console.log('\n📝 Step 1: Testing Admin Login')
    const loginResponse = await fetch('http://localhost:3001/api/auth/admin/login-mock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@genedu.com',
        password: 'admin123'
      })
    })
    
    console.log('Login Status:', loginResponse.status)
    const loginData = await loginResponse.json()
    console.log('Login Response:', loginData)
    
    // Step 2: Check cookies (in browser context this would work)
    console.log('\n🍪 Step 2: Cookie Information')
    const cookieHeader = loginResponse.headers.get('set-cookie')
    console.log('Set-Cookie Header:', cookieHeader)
    
    // Step 3: Test auth verification with token from response
    console.log('\n🔍 Step 3: Testing Auth Verification')
    const authResponse = await fetch('http://localhost:3001/api/auth/admin/me-mock', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    })
    
    console.log('Auth Verification Status:', authResponse.status)
    const authData = await authResponse.json()
    console.log('Auth Verification Response:', authData)
    
    // Step 4: Test with cookie (simulate browser)
    console.log('\n🔐 Step 4: Testing with Cookie')
    if (cookieHeader) {
      const cookieValue = cookieHeader.split('admin-token=')[1]?.split(';')[0]
      console.log('Extracted Cookie Value:', cookieValue?.substring(0, 50) + '...')
      
      const cookieAuthResponse = await fetch('http://localhost:3001/api/auth/admin/me-mock', {
        method: 'GET',
        headers: {
          'Cookie': `admin-token=${cookieValue}`
        }
      })
      
      console.log('Cookie Auth Status:', cookieAuthResponse.status)
      const cookieAuthData = await cookieAuthResponse.json()
      console.log('Cookie Auth Response:', cookieAuthData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAdminAuthFlow()
