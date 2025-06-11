import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database and get user
    await dbConnect();
    const user = await User.findByUserId(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Sanitize user data
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    return NextResponse.json({
      success: true,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    // Connect to database and get user
    await dbConnect();
    const user = await User.findByUserId(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'name',
      'avatar',
      'preferences',
      'profile'
    ];

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'preferences' || key === 'profile') {
          // Merge nested objects
          user[key] = { ...user[key], ...updateData[key] };
        } else {
          user[key] = updateData[key];
        }
      }
    });

    await user.save();

    // Sanitize user data
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    const errorMessage = AuthUtils.formatAuthError(error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
