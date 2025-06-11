import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from "@/lib/database/mongodb"
import Quiz from '@/lib/models/Quiz'
import { AuthUtils } from '@/lib/auth/utils'

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

    await connectToDatabase()

    const quizzes = await Quiz.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .select('quizId title description metadata stats createdAt')
      .limit(20)

    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.quizId,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.metadata.difficulty,
      totalQuestions: quiz.questions?.length || 0,
      estimatedTime: quiz.metadata.estimatedTime,
      totalAttempts: quiz.stats.totalAttempts,
      averageScore: quiz.stats.averageScore,
      createdAt: quiz.createdAt,
    }))

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes
    })

  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
