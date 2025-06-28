import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/auth/verify-token'
import NotebookRAGService from '@/lib/services/notebook-rag-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const user = await verifyUserToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: notebookId } = await params
    const body = await request.json()
    const { query, question, limit = 5, includeContext = true } = body

    // Support both 'query' and 'question' field names for compatibility
    const userQuery = query || question
    
    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Query/question is required and must be a non-empty string' 
      }, { status: 400 })
    }

    const ragService = new NotebookRAGService()

    // Query the notebook using RAG
    const ragResult = await ragService.queryNotebook(
      notebookId,
      user.userId,
      userQuery.trim(),
      limit
    )

    return NextResponse.json({
      success: true,
      response: ragResult.answer,
      sources: ragResult.sources,
      confidence: ragResult.confidence,
      totalSources: ragResult.sources.length,
      data: {
        question: userQuery.trim(),
        answer: ragResult.answer,
        sources: ragResult.sources,
        confidence: ragResult.confidence,
        totalSources: ragResult.sources.length
      }
    })

  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Query failed'
    }, { status: 500 })
  }
}
