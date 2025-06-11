import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';
import Notebook from '@/lib/models/Notebook';
import Quiz from '@/lib/models/Quiz';
import { ActivityTracker } from '@/lib/utils/activity-tracker';

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
    const user = await User.findOne({ userId: payload.userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }    // Get activity statistics
    const activityStats = await ActivityTracker.getActivityStats(payload.userId);
    
    // Get recent activities
    const recentActivities = await ActivityTracker.getRecentActivities(payload.userId, 10);
    
    // Get notebook count
    const notebookCount = await Notebook.countDocuments({ userId: payload.userId });
    
    // Get quiz statistics
    const [
      quizzesCreatedCount,
      allUserQuizAttempts
    ] = await Promise.all([
      Quiz.countDocuments({ userId: payload.userId }),
      Quiz.aggregate([
        { $match: { $or: [{ userId: payload.userId }, { 'attempts.userId': payload.userId }] } },
        { $unwind: '$attempts' },
        { $match: { 'attempts.userId': payload.userId } },
        { $project: { 
          attempt: '$attempts',
          quizId: '$quizId',
          title: '$title'
        }}
      ])
    ]);

    const quizzesCompletedCount = allUserQuizAttempts.length;
    
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
      
      // Quiz stats (real data from database)
      quizzesCompleted: quizzesCompletedCount,
      quizzesCreated: quizzesCreatedCount,
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
