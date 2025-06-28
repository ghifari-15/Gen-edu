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

    // Parse multipart form data for file upload
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No files provided' 
      }, { status: 400 })
    }

    // Validate file types (only PDFs)
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    if (pdfFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only PDF files are supported' 
      }, { status: 400 })
    }

    // Convert files to buffers
    const fileBuffers = await Promise.all(
      pdfFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        name: file.name
      }))
    )

    const ragService = new NotebookRAGService()

    // Process PDFs and add to RAG collection
    const result = await ragService.addPDFDocuments(
      notebookId,
      user.userId,
      fileBuffers
    )

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.documentsAdded} PDF files`,
      data: {
        documentsAdded: result.documentsAdded,
        chunksCreated: result.chunks,
        files: pdfFiles.map(f => f.name)
      }
    })

  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process PDF files'
    }, { status: 500 })
  }
}

export async function GET(
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
    const ragService = new NotebookRAGService()

    // Get notebook statistics
    const stats = await ragService.getNotebookStats(notebookId, user.userId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get notebook stats error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get notebook statistics'
    }, { status: 500 })
  }
}

export async function DELETE(
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
    const ragService = new NotebookRAGService()

    // Delete entire notebook collection
    const success = await ragService.deleteNotebookCollection(notebookId, user.userId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notebook RAG data cleared successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to clear notebook RAG data'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Clear notebook RAG error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to clear notebook RAG data'
    }, { status: 500 })
  }
}
