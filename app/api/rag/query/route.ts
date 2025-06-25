import { NextRequest, NextResponse } from 'next/server'
import RAGService from '@/lib/services/rag-service'

export async function POST(request: NextRequest) {
  let ragService: RAGService | null = null
  
  try {
    const { query, question, limit = 5 } = await request.json()
    const userQuery = query || question

    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Query is required and must be a string'
      }, { status: 400 })
    }

    ragService = new RAGService()
    const result = await ragService.queryRAG(userQuery, limit)

    return NextResponse.json({
      success: true,
      answer: result.answer,
      relevantKnowledge: result.sources,
      confidence: result.confidence,
      data: result
    })
  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process your question'
    }, { status: 500 })
  } finally {
    if (ragService) {
      await ragService.close()
    }
  }
}
