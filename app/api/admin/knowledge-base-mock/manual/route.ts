import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import KnowledgeBaseStorage from '@/lib/storage/knowledge-base-storage'

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    if (!title || !content || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title, content, and category are required' 
      }, { status: 400 })
    }

    const newEntry = {
      title,
      content,
      category,
      tags: tags || [],
      source: 'manual' as const
    }

    const storage = KnowledgeBaseStorage.getInstance()
    const savedEntry = storage.add(newEntry)

    return NextResponse.json({
      success: true,
      entry: savedEntry,
      message: 'Knowledge entry added successfully'
    })
  } catch (error) {
    console.error('Knowledge base add error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
