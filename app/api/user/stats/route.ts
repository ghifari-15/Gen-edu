import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Notebook from '@/lib/models/Notebook';

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

    await dbConnect();

    // Get user basic info
    const user = await User.findByUserId(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get activity statistics
    const activityStats = await Activity.getActivityStats(payload.userId);
    
    // Get recent activities
    const recentActivities = await Activity.findByUserId(payload.userId, 10);
    
    // Get notebook count
    const notebookCount = await Notebook.countDocuments({ userId: payload.userId });
    
    // Get learning streak and other stats
    const profileStats = {
      // Basic stats
      notebooksCreated: activityStats.notebooksCreated,
      totalLearningHours: activityStats.totalLearningHours,
      streakDays: activityStats.streakDays,
      activeDays: activityStats.activeDays,
      
      // Additional stats
      totalActivities: activityStats.totalActivities,
      totalNotebooks: notebookCount,
      
      // User info
      joinedDate: user.createdAt,
      lastActive: user.statistics?.lastActive || user.updatedAt,
      
      // Placeholder for quiz stats (to be implemented later)
      quizzesCompleted: user.statistics?.quizzesCompleted || 0,
      quizzesCreated: user.statistics?.quizzesCreated || 0,
    };

    // Format recent activities for display
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.activityId,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      metadata: activity.metadata,
      timeAgo: getTimeAgo(activity.timestamp),
    }));

    return NextResponse.json({
      success: true,
      stats: profileStats,
      activities: formattedActivities,
    });

  } catch (error) {
    console.error('Get profile stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
