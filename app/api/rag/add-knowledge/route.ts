import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import RAGService from '@/lib/services/rag-service'

export async function POST(request: NextRequest) {
  let ragService: RAGService | null = null
  
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { knowledge } = await request.json()

    if (!knowledge || !knowledge.title || !knowledge.content) {
      return NextResponse.json({
        success: false,
        message: 'Knowledge title and content are required'
      }, { status: 400 })
    }

    ragService = new RAGService()
    const vectorId = await ragService.addKnowledgeToRAG({
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category || 'General',
      tags: knowledge.tags || [],
      source: knowledge.source || 'manual'
    })

    if (!vectorId) {
      return NextResponse.json({
        success: false,
        message: 'Failed to add knowledge to vector database'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge added to RAG system successfully',
      vectorId
    })
  } catch (error) {
    console.error('Add knowledge to RAG error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to add knowledge to RAG system'
    }, { status: 500 })
  } finally {
    if (ragService) {
      await ragService.close()
    }
  }
}
