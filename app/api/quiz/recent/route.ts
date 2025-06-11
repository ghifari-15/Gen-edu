import { NextRequest, NextResponse } from 'next/server'
import { AuthUtils } from '@/lib/auth/utils'
import dbConnect from '@/lib/database/mongodb'
import Quiz from '@/lib/models/Quiz'

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

    // Get recent quiz attempts for this user
    const recentQuizResults = await Quiz.aggregate([
      { $match: { 'attempts.userId': payload.userId } },
      { $unwind: '$attempts' },
      { $match: { 'attempts.userId': payload.userId } },
      {
        $project: {
          quizId: '$quizId',
          title: '$title',
          difficulty: '$metadata.difficulty',
          totalQuestions: { $size: '$questions' },
          attempt: '$attempts',
          createdAt: '$attempts.completedAt'
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 }
    ])

    // Format the results
    const formattedResults = recentQuizResults.map(result => ({
      id: result.quizId,
      name: result.title,
      score: result.attempt.percentage,
      questions: result.totalQuestions,
      difficulty: result.difficulty,
      date: new Date(result.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      timestamp: result.createdAt
    }))

    return NextResponse.json({
      success: true,
      results: formattedResults
    })

  } catch (error) {
    console.error('Error fetching recent quiz results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent quiz results' },
      { status: 500 }
    )
  }
}
