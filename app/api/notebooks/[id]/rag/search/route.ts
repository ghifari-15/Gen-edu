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
    const { 
      query, 
      limit = 5, 
      scoreThreshold = 0.3,
      sourceFilter 
    } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Query is required and must be a string' 
      }, { status: 400 })
    }

    const ragService = new NotebookRAGService()

    // Search using the enhanced search method
    const searchResults = await ragService.searchDocuments(
      notebookId,
      user.userId,
      query,
      {
        limit,
        scoreThreshold,
        sourceFilter
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: searchResults.results,
        totalResults: searchResults.totalResults,
        options: {
          limit,
          scoreThreshold,
          sourceFilter
        }
      }
    })

  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 })
  }
}
