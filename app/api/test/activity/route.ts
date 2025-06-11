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

    await dbConnect();

    // Test creating an activity directly
    const activity = new Activity({
      userId: payload.userId,
      type: 'notebook_created',
      title: 'Test Activity',
      description: 'Testing activity creation',
      metadata: {
        notebookId: 'test-123',
        sessionDuration: 5,
      }
    });

    await activity.save();

    // Try using the static method
    const activityViaMethod = await (Activity as any).trackActivity(payload.userId, 'login', {
      title: 'Test Login Activity',
      description: 'Testing login activity',
      metadata: {}
    });

    // Get all activities for this user
    const allActivities = await Activity.find({ userId: payload.userId });

    return NextResponse.json({
      success: true,
      message: 'Test activities created',
      directActivity: activity,
      methodActivity: activityViaMethod,
      allActivities: allActivities,
      count: allActivities.length
    });

  } catch (error) {
    console.error('Test activity error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: 'Error creating test activity', error: errorMessage },
      { status: 500 }
    );
  }
}
