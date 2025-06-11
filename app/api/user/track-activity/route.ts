import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import Activity from '@/lib/models/Activity';

export async function POST(request: NextRequest) {
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

    const { type, title, description, metadata } = await request.json();

    if (!type || !title) {
      return NextResponse.json(
        { success: false, message: 'Type and title are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Track the activity
    const activity = await (Activity as any).trackActivity(payload.userId, type, {
      title,
      description,
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      activityId: activity.activityId
    });

  } catch (error) {
    console.error('Track activity error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
