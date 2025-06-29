import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import { MongoClient, ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, category, tags } = body

    if (!title || !content || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title, content, and category are required' 
      }, { status: 400 })
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('knowledgebases')

    // Update the knowledge entry
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          text: content,
          category,
          tags: tags || [],
          'metadata.updatedAt': new Date().toISOString()
        }
      }
    )

    await client.close()

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Knowledge entry not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('knowledgebases')

    // Delete the knowledge entry
    const deleteResult = await collection.deleteOne({
      _id: new ObjectId(id)
    })

    await client.close()

    if (deleteResult.deletedCount === 0) {
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
