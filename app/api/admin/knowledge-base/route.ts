import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import { MongoClient, ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('knowledgebases')
    
    // Get all knowledge entries with metadata
    const knowledgeEntries = await collection
      .find({})
      .sort({ 'metadata.createdAt': -1 })
      .toArray()
    
    // Format the data for frontend consumption
    const formattedEntries = knowledgeEntries.map(entry => ({
      id: entry._id.toString(),
      title: entry.title,
      content: entry.text,
      category: entry.category,
      tags: entry.tags || [],
      source: entry.metadata?.source || 'unknown',
      createdAt: entry.metadata?.createdAt || new Date().toISOString(),
      updatedAt: entry.metadata?.updatedAt || new Date().toISOString()
    }))
    
    await client.close()

    return NextResponse.json({
      success: true,
      entries: formattedEntries
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

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('knowledgebases')
    
    // Delete the knowledge entry
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    await client.close()

    if (result.deletedCount === 0) {
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