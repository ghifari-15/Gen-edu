import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@genedu.com',
  password: 'admin123',
  user: {
    userId: 'admin_001',
    email: 'admin@genedu.com',
    name: 'Admin GenEdu',
    role: 'admin',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    if (email.toLowerCase() !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token for consistency
    const token = jwt.sign(
      {
        userId: ADMIN_CREDENTIALS.user.userId,
        email: ADMIN_CREDENTIALS.user.email,
        role: ADMIN_CREDENTIALS.user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { 
        expiresIn: '7d',
        issuer: 'genedu-app'
      }
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: ADMIN_CREDENTIALS.user
    })

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
