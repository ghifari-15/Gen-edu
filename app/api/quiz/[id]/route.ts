import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from "@/lib/database/mongodb"
import Quiz from '@/lib/models/Quiz'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    
    const { id } = await params
    const quiz = await Quiz.findOne({ quizId: id })
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Increment view count
    quiz.stats.views += 1
    await quiz.save()

    return NextResponse.json({
      id: quiz.quizId,
      title: quiz.title,
      description: quiz.description,      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        options: q.options?.map((opt: any) => opt.text) || [],
        correctAnswer: q.options?.findIndex((opt: any) => opt.isCorrect) || 0,
        type: q.type,
        points: q.points,
        difficulty: q.difficulty
      })),
      totalQuestions: quiz.questions.length,
      difficulty: quiz.metadata.difficulty,
      estimatedTime: quiz.metadata.estimatedTime,
      settings: quiz.settings,
      stats: quiz.stats
    })

  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}
