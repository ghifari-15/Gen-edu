import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // Find admin user
    const adminUser = await collection.findOne({ 
      email: email.toLowerCase(),
      role: 'admin'
    });

    if (!adminUser) {
      await client.close()
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await AuthUtils.comparePassword(password, adminUser.password);
    if (!isValidPassword) {
      await client.close()
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await collection.updateOne(
      { userId: adminUser.userId },
      { $set: { lastLogin: new Date() } }
    )

    await client.close()

    // Generate admin token
    const tokenPayload = {
      userId: adminUser.userId,
      email: adminUser.email,
      role: adminUser.role
    }
    const token = AuthUtils.generateToken(tokenPayload as any);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        createdAt: adminUser.createdAt,
        lastLogin: new Date()
      }
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
