import { NextRequest, NextResponse } from 'next/server'
import VectorDatabase from '@/lib/database/vector-database'

export async function GET(request: NextRequest) {
  let vectorDB: VectorDatabase | null = null
  
  try {
    console.log('Testing MongoDB connection...')
    
    // Test connection
    vectorDB = new VectorDatabase()
    
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Try to add a test knowledge entry
    const testKnowledge = {
      text: "This is a test knowledge entry for connection testing.",
      title: "Test Connection",
      category: "System Test",
      tags: ["test", "connection"],
      embedding: Array(768).fill(0.1), // Mock embedding with 768 dimensions
      metadata: {
        source: "test",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    const result = await vectorDB.addVector(testKnowledge)
    
    if (result) {
      // Get all vectors to confirm
      const allVectors = await vectorDB.searchSimilar(Array(768).fill(0.1), 10, 0)
      
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection successful!',
        details: {
          mongoUri: process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set',
          mongoDb: process.env.MONGODB_DB || 'genedu',
          testEntryId: result,
          totalEntries: allVectors.length,
          deepinfraToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to add test entry to MongoDB',
        details: {
          mongoUri: process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set',
          mongoDb: process.env.MONGODB_DB || 'genedu',
          deepinfraToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set'
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        mongoUri: process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set',
        mongoDb: process.env.MONGODB_DB || 'genedu',
        deepinfraToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set'
      }
    }, { status: 500 })
  } finally {
    if (vectorDB) {
      await vectorDB.close()
    }
  }
}
