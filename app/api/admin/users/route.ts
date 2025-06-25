import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/verify-token'
import { MongoClient } from 'mongodb'
import { AuthUtils } from '@/lib/auth/utils'
import { randomUUID } from 'crypto'

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
    
    // Get all users except admin
    const users = await collection
      .find({ role: { $ne: 'admin' } })
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
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!AuthUtils.isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = AuthUtils.isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await client.close()
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user document
    const newUser = {
      userId: randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: true, // Auto-verify admin-created users
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
        bio: '',
        institution: '',
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
        plan: 'free',
        status: 'active',
        trialUsed: false
      }
    };

    // Insert user into database
    const result = await collection.insertOne(newUser);
    
    await client.close()

    if (result.insertedId) {
      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
