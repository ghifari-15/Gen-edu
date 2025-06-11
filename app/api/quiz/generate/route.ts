import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from "@/lib/database/mongodb"
import Quiz from '@/lib/models/Quiz'
import { AuthUtils } from '@/lib/auth/utils'
import { ActivityTracker } from '@/lib/utils/activity-tracker'
import { Mistral } from '@mistralai/mistralai'
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
})

const llm = new ChatOpenAI({
  model: "deepseek-ai/DeepSeek-V3-0324-Turbo",
  apiKey: process.env.DEEPINFRA_API_KEY,
  temperature: 0.7,
  configuration: {
    baseURL: "https://api.deepinfra.com/v1/openai"
  }
})

const systemPrompt = new SystemMessage(`
You are a quiz generator AI. Your task is to create quizzes in strict JSON format based on the study material provided by the user. Follow this structure exactly:

{
  "quizTitle": "Title of the quiz",
  "quizDescription": "Brief description of the quiz content",
  "questions": [
    {
      "questionText": "Question text here",
      "questionNumber": 1,
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A"
    }
  ]
}

Rules:
1. Extract key concepts from the provided material to generate relevant questions
2. Ensure all options are well-structured and diverse
3. The correctAnswer must be exactly one of the options provided
4. Output only valid JSON. Any other text is strictly forbidden
5. Generate questions based on the specified difficulty and number
6. Focus on the most important concepts from the material
`)

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

    await connectToDatabase()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const numQuestions = parseInt(formData.get('numQuestions') as string) || 10
    const difficulty = formData.get('difficulty') as string || 'Medium'
    const language = formData.get('language') as string || 'English'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    // Upload PDF to Mistral for OCR processing
    const fileBuffer = await file.arrayBuffer()
    const uploadedFile = await mistralClient.files.upload({
      file: {
        fileName: file.name,
        content: new Uint8Array(fileBuffer),
      },
      purpose: "ocr",
    })

    // Wait for file processing
    await mistralClient.files.retrieve({
      fileId: uploadedFile.id
    })

    // Get signed URL for OCR processing
    const signedUrl = await mistralClient.files.getSignedUrl({
      fileId: uploadedFile.id,
    })

    // Process OCR
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: signedUrl.url,
      }
    })

    const extractedText = ocrResponse.pages.map(page => page.markdown).join('\n\n')

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the PDF' }, { status: 400 })
    }

    // Generate quiz using LLM
    const humanMessage = new HumanMessage(`
    Difficulty: ${difficulty}
    Number of Questions: ${numQuestions}
    Language: ${language}
    Material: ${extractedText}
    `)

    const response = await llm.invoke([systemPrompt, humanMessage])
      let quizData
    try {
      // Parse the LLM response
      let responseText = response.content as string
      
      // Remove markdown code blocks if present
      responseText = responseText.trim()
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      quizData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError)
      console.error('Raw response:', response.content)
      return NextResponse.json({ error: 'Failed to generate valid quiz format' }, { status: 500 })
    }

    // Validate quiz data structure
    if (!quizData.quizTitle || !quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json({ error: 'Invalid quiz format generated' }, { status: 500 })
    }    // Transform the quiz data to match our schema
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Map difficulty levels correctly
    const mapDifficulty = (diff: string) => {
      const lower = diff.toLowerCase()
      if (lower === 'easy') return { questionDiff: 'easy' as const, metaDiff: 'beginner' as const }
      if (lower === 'medium') return { questionDiff: 'medium' as const, metaDiff: 'intermediate' as const }
      if (lower === 'hard') return { questionDiff: 'hard' as const, metaDiff: 'advanced' as const }
      return { questionDiff: 'medium' as const, metaDiff: 'intermediate' as const }
    }
    
    const { questionDiff, metaDiff } = mapDifficulty(difficulty)
    
    const transformedQuestions = quizData.questions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      type: 'multiple-choice' as const,
      question: q.questionText,
      options: q.options.map((option: string, optIndex: number) => ({
        id: `opt${optIndex + 1}`,
        text: option,
        isCorrect: option === q.correctAnswer,
      })),
      correctAnswer: q.correctAnswer,
      points: 1,
      difficulty: questionDiff,
      tags: [],
    }))// Create quiz object
    const quiz = new Quiz({
      quizId,
      title: quizData.quizTitle,
      description: quizData.quizDescription || `Generated quiz from ${file.name}`,
      userId: payload.userId,
      questions: transformedQuestions,
      settings: {
        timeLimit: Math.max(numQuestions * 2, 10), // 2 minutes per question, minimum 10
        attempts: 3,
        randomizeQuestions: false,
        randomizeOptions: false,
        showCorrectAnswers: true,
        showExplanations: false,
        passingScore: 70,
        isPublic: false,
      },      metadata: {
        subject: 'Generated Quiz',
        difficulty: metaDiff,
        estimatedTime: Math.max(numQuestions * 2, 10),
        tags: [metaDiff, 'generated'],
        category: 'auto-generated',
      },
      attempts: [],
      stats: {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
        views: 0,
      },
      isTemplate: false,
    })

    await quiz.save()    // Track activity
    try {
      await ActivityTracker.trackActivity(
        payload.userId,
        'quiz_created',
        {
          title: `Created quiz: ${quizData.quizTitle}`,
          description: `Generated quiz with ${transformedQuestions.length} questions`,          metadata: {
            quizId: quiz.quizId,
            questionsCount: transformedQuestions.length,
            difficulty: metaDiff,
            source: 'pdf_upload',
          }
        }
      )
    } catch (activityError) {
      console.error('Failed to track activity:', activityError)
      // Don't fail the request if activity tracking fails
    }

    // Clean up uploaded file from Mistral
    try {
      await mistralClient.files.delete({ fileId: uploadedFile.id })
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError)
      // Don't fail the request if cleanup fails
    }    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.quizId,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length,
        difficulty: quiz.metadata.difficulty,
        estimatedTime: quiz.metadata.estimatedTime,
      }
    })

  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    )
  }
}
