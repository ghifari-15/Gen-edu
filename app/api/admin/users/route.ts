import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/verify-token'
import { MongoClient } from 'mongodb'
import { AuthUtils } from '@/lib/auth/utils'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')
    
    // Get all users
    const users = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    // Format the data for frontend consumption (exclude sensitive info)
    const formattedUsers = users.map(user => ({
      userId: user.userId,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role || 'student',
      isVerified: user.isVerified || false,
      status: user.status || 'active',
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt || new Date().toISOString(),
      profileData: user.profileData || {}
    }))
    
    await client.close()

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/users called')
    
    const adminUser = await verifyAdminToken(request)
    console.log('Admin verification result:', !!adminUser)
    
    if (!adminUser) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid JSON in request body' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { name, email, password, role } = body

    console.log('Creating user with data:', { name, email, role })

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        success: false, 
        message: 'All fields are required' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role specified' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ✅ Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email format' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ✅ Simple password validation
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const uri = process.env.MONGODB_URI!
    if (!uri) {
      console.error('MONGODB_URI not set')
      return NextResponse.json({ 
        success: false, 
        message: 'Database configuration error' 
      }, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'User with this email already exists' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      userId: randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: true, // Admin-created users are auto-verified
      emailVerified: true, // Add for compatibility
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      verifiedAt: new Date() // Add verification timestamp
    }

    await collection.insertOne(newUser)
    await client.close()

    console.log('User created successfully:', newUser.userId)

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
