import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import KnowledgeBaseStorage from '@/lib/storage/knowledge-base-storage'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const storage = KnowledgeBaseStorage.getInstance()
    const entries = storage.getAll()

    return NextResponse.json({
      success: true,
      entries: entries
    })
  } catch (error) {
    console.error('Knowledge base fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Knowledge entry ID is required' 
      }, { status: 400 })
    }

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
