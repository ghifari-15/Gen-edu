import { NextRequest, NextResponse } from 'next/server'
import { AuthUtils } from '@/lib/auth/utils'
import dbConnect from '@/lib/database/mongodb'
import Quiz from '@/lib/models/Quiz'
import Activity from '@/lib/models/Activity'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()

    // Get quiz statistics for the user
    const [
      totalQuizzes,
      recentActivities,
      allQuizAttempts
    ] = await Promise.all([
      // Total quizzes created by user
      Quiz.countDocuments({ userId: payload.userId }),

      // Get recent quiz activities for daily/weekly stats (using timestamp field)
      Activity.find({
        userId: payload.userId,
        type: { $in: ['quiz_created', 'quiz_completed'] },
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).sort({ timestamp: -1 }),

      // Get all quiz attempts from all quizzes (including attempts by this user on any quiz)
      Quiz.aggregate([
        { $match: { $or: [{ userId: payload.userId }, { 'attempts.userId': payload.userId }] } },
        { $unwind: '$attempts' },
        { $match: { 'attempts.userId': payload.userId } },
        {
          $project: {
            attempt: '$attempts',
            quizId: '$quizId',
            title: '$title',
            metadata: '$metadata'
          }
        }
      ])
    ])

    // Calculate time-based statistics
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyAttempts = recentActivities.filter((activity: any) =>
      activity.timestamp >= oneDayAgo &&
      activity.type === 'quiz_completed'
    ).length

    const weeklyAttempts = recentActivities.filter((activity: any) =>
      activity.timestamp >= oneWeekAgo &&
      activity.type === 'quiz_completed'
    ).length

    const monthlyAttempts = recentActivities.filter((activity: any) =>
      activity.timestamp >= oneMonthAgo &&
      activity.type === 'quiz_completed'
    ).length    // Calculate completion rate and total attempts from actual quiz data
    const totalAttempts = allQuizAttempts.length
    const totalScore = allQuizAttempts.reduce((sum: number, attempt: any) => sum + (attempt.attempt.percentage || 0), 0)
    const overallCompletionRate = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0

    console.log('Quiz Stats Debug:', {
      totalQuizzes,
      totalAttempts,
      overallCompletionRate,
      recentActivitiesCount: recentActivities.length,
      allQuizAttemptsCount: allQuizAttempts.length,
      sampleActivity: recentActivities[0],
      sampleAttempt: allQuizAttempts[0]
    })

    // Generate chart data for the last 7 days
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayAttempts = recentActivities.filter((activity: any) =>
        activity.timestamp >= dayStart &&
        activity.timestamp <= dayEnd &&
        activity.type === 'quiz_completed'
      ).length

      chartData.push(dayAttempts)
    }

    // Calculate percentage changes (mock calculation based on available data)
    const previousMonthAttempts = Math.max(1, monthlyAttempts - 5) // Mock previous month data
    const monthlyGrowth = monthlyAttempts > 0 ?
      Math.round(((monthlyAttempts - previousMonthAttempts) / previousMonthAttempts) * 100) : 0

    const previousWeekAttempts = Math.max(1, weeklyAttempts - 2) // Mock previous week data
    const weeklyGrowth = weeklyAttempts > 0 ?
      Math.round(((weeklyAttempts - previousWeekAttempts) / previousWeekAttempts) * 100) : 0

    const previousDayAttempts = Math.max(1, dailyAttempts - 1) // Mock previous day data
    const dailyGrowth = dailyAttempts > 0 ?
          Math.round(((dailyAttempts - previousDayAttempts) / previousDayAttempts) * 100) : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalQuizzes,
        totalAttempts,
        completionRate: overallCompletionRate,
        averageScore,
        chartData,
        growth: {
          daily: dailyGrowth,
          weekly: weeklyGrowth,
          monthly: monthlyGrowth
        },
        timeStats: {
          dailyAttempts,
          weeklyAttempts,
          monthlyAttempts
        }
      }
    })

  } catch (error) {
    console.error('Error fetching quiz stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz statistics' },
      { status: 500 }
    )
  }
}
