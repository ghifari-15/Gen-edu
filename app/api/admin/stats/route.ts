import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Verify admin role
    const adminUser = await User.findOne({ 
      userId: payload.userId, 
      role: 'admin' 
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get statistics
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // TODO: Add knowledge base count when knowledge base model is implemented
    const totalKnowledgeBase = 0;

    const stats = {
      totalUsers,
      totalKnowledgeBase,
      activeUsers,
      systemHealth: 'Good'
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
