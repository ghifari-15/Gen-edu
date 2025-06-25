import { NextRequest, NextResponse } from 'next/server'
import EmbeddingService from '@/lib/services/embedding-service'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing DeepInfra embedding service...')
    
    const embeddingService = new EmbeddingService()
    
    // Test with a simple text
    const testText = "This is a test sentence for embedding generation."
    const embedding = await embeddingService.generateEmbedding(testText)
    
    if (embedding) {
      return NextResponse.json({
        success: true,
        message: 'DeepInfra API connection successful!',
        details: {
          apiToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set',
          testText: testText,
          embeddingDimensions: embedding.length,
          embeddingPreview: embedding.slice(0, 5), // Show first 5 values
          model: "BAAI/bge-base-en-v1.5"
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate embedding',
        details: {
          apiToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set',
          model: "BAAI/bge-base-en-v1.5"
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('DeepInfra API test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'DeepInfra API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        apiToken: process.env.DEEPINFRA_API_KEY ? 'Set (hidden for security)' : 'Not set',
        model: "BAAI/bge-base-en-v1.5"
      }
    }, { status: 500 })
  }
}
