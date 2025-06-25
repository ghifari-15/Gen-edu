import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No admin token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Connect to database and get admin user
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')
    
    const adminUser = await collection.findOne({ 
      userId: payload.userId,
      role: 'admin'
    });
    
    if (!adminUser) {
      await client.close()
      return NextResponse.json(
        { success: false, message: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Update last active
    await collection.updateOne(
      { userId: adminUser.userId },
      { $set: { lastLogin: new Date() } }
    )

    await client.close()

    return NextResponse.json({
      success: true,
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

  } catch (error) {
    console.error('Admin me endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
