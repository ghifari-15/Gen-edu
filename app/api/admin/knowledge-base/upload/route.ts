import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'
import KnowledgeBaseStorage from '@/lib/storage/knowledge-base-storage'

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'No file provided' 
      }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unsupported file type. Please upload .txt, .pdf, .doc, or .docx files.' 
      }, { status: 400 })
    }

    // Process file content (simplified - in real implementation, you'd parse different file types)
    let content = ''
    if (file.type === 'text/plain') {
      content = await file.text()
    } else {
      // For other file types, you'd need specialized libraries like pdf-parse, mammoth, etc.
      content = `Content from uploaded file: ${file.name}. File processing for ${file.type} not fully implemented in this demo.`
    }

    // Split content into chunks if it's too long
    const maxChunkSize = 2000
    const chunks = []
    
    if (content.length <= maxChunkSize) {
      chunks.push({
        title: file.name,
        content: content,
        category: 'Uploaded Documents',
        tags: ['uploaded', file.name.split('.')[0]]
      })
    } else {
      // Split into multiple chunks
      const numChunks = Math.ceil(content.length / maxChunkSize)
      for (let i = 0; i < numChunks; i++) {
        const start = i * maxChunkSize
        const end = Math.min((i + 1) * maxChunkSize, content.length)
        const chunkContent = content.slice(start, end)
        
        chunks.push({
          title: `${file.name} (Part ${i + 1}/${numChunks})`,
          content: chunkContent,
          category: 'Uploaded Documents',
          tags: ['uploaded', file.name.split('.')[0], `part-${i + 1}`]
        })
      }
    }

    // Create knowledge entries using storage
    const storage = KnowledgeBaseStorage.getInstance()
    const newEntries = chunks.map(chunk => ({
      ...chunk,
      source: 'upload' as const
    }))

    const savedEntries = newEntries.map(entry => storage.add(entry))

    return NextResponse.json({
      success: true,
      entries: savedEntries,
      message: `Successfully processed ${savedEntries.length} knowledge entries from ${file.name}`
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}