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
    const { content, fileName = 'text_input' } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Content is required and must be a string' 
      }, { status: 400 })
    }

    const ragService = new NotebookRAGService()

    // Add text content to RAG collection
    const result = await ragService.addTextContent(
      notebookId,
      user.userId,
      content,
      fileName
    )

    return NextResponse.json({
      success: true,
      message: `Successfully added text content`,
      data: {
        fileName,
        chunksCreated: result.chunks
      }
    })

  } catch (error) {
    console.error('Add text content error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add text content'
    }, { status: 500 })
  }
}
