import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import { MongoClient } from 'mongodb'

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
      category: entry.category,
      tags: entry.tags || [],
      source: entry.metadata?.source || 'unknown',
      content: entry.text,
      contentLength: entry.text?.length || 0,
      hasEmbedding: !!entry.embedding,
      embeddingLength: entry.embedding?.length || 0,
      createdAt: entry.metadata?.createdAt || new Date().toISOString(),
      updatedAt: entry.metadata?.updatedAt || new Date().toISOString()
    }))
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      data: formattedEntries,
      total: formattedEntries.length
    })
  } catch (error) {
    console.error('Failed to fetch knowledge entries:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch knowledge entries'
    }, { status: 500 })
  }
}
