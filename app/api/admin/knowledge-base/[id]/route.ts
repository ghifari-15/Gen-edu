import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import KnowledgeBaseStorage from '@/lib/storage/knowledge-base-storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, content, category, tags } = body

    if (!title || !content || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title, content, and category are required' 
      }, { status: 400 })
    }

    const storage = KnowledgeBaseStorage.getInstance()
    const updatedEntry = storage.update(id, {
      title,
      content,
      category,
      tags: tags || []
    })

    if (!updatedEntry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Knowledge entry not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
      message: 'Knowledge entry updated successfully'
    })
  } catch (error) {
    console.error('Knowledge base update error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const storage = KnowledgeBaseStorage.getInstance()
    const success = storage.delete(id)

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Knowledge entry not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge entry deleted successfully'
    })
  } catch (error) {
    console.error('Knowledge base delete error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
