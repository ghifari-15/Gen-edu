import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from "@/lib/database/mongodb"
import Quiz from '@/lib/models/Quiz'
import { AuthUtils } from '@/lib/auth/utils'
import { ActivityTracker } from '@/lib/utils/activity-tracker'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { answers } = await request.json()
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 })
    }

    const quiz = await Quiz.findOne({ quizId: params.id })
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }    // Calculate score
    let correctAnswers = 0
    let totalPoints = 0
    const detailedResults: any[] = []

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id]
      const correctOption = question.options?.find((opt: any) => opt.isCorrect)
      const isCorrect = correctOption?.text === userAnswer
      
      if (isCorrect) {
        correctAnswers++
        totalPoints += question.points
      }

      detailedResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: correctOption?.text,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      })
    }

    const maxPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)
    const percentage = Math.round((totalPoints / maxPoints) * 100)    // Create attempt record
    const attempt = {
      userId: payload.userId,
      startedAt: new Date(),
      completedAt: new Date(),
      answers: detailedResults.map(result => ({
        questionId: result.questionId,
        answer: result.userAnswer,
        isCorrect: result.isCorrect,
        pointsEarned: result.points
      })),
      score: totalPoints,
      totalPoints: maxPoints,
      percentage,
      isCompleted: true
    }

    // Add attempt to quiz
    quiz.attempts.push(attempt as any)
      // Update quiz stats
    quiz.stats.totalAttempts += 1;
    const allScores = quiz.attempts.map((a: any) => a.percentage)
    quiz.stats.averageScore = Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length)
    quiz.stats.completionRate = Math.round((quiz.attempts.filter((a: any) => a.isCompleted).length / quiz.stats.totalAttempts) * 100)

    await quiz.save()    // Track activity
    try {
      await ActivityTracker.trackActivity(
        payload.userId,
        'quiz_completed',
        {
          title: `Completed quiz: ${quiz.title}`,
          description: `Scored ${percentage}% (${correctAnswers}/${quiz.questions.length} correct)`,          metadata: {
            quizId: quiz.quizId,
            score: percentage,
            questionsCount: quiz.questions.length,
            questionsCorrect: correctAnswers,
            difficulty: quiz.metadata.difficulty,
          }
        }
      )
    } catch (activityError) {
      console.error('Failed to track activity:', activityError)
    }

    return NextResponse.json({
      success: true,
      results: {
        score: totalPoints,
        totalPoints: maxPoints,
        percentage,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passed: percentage >= quiz.settings.passingScore,
        details: detailedResults
      }
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
