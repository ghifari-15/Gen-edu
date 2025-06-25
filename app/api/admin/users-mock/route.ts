import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'

// Mock database - Replace with actual database
let users: any[] = [
  {
    userId: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    isVerified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    userId: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: '3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'student',
    isVerified: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: '4',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: null
  }
]

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      users: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, email, password, and role are required' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists' 
      }, { status: 400 })
    }

    const newUser = {
      userId: (users.length + 1).toString(),
      name,
      email,
      role,
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    users.push(newUser)

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
