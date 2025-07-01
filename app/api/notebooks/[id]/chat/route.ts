import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from "@/lib/database/mongodb"
import ChatThread from '@/lib/models/ChatThread'
import { AuthUtils } from '@/lib/auth/utils'
import { Mistral } from '@mistralai/mistralai'
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages"

/**
 * Notebook Chat API - Serverless-Compatible OCR Processing
 * 
 * This API handles PDF upload and chat functionality for notebooks.
 * ✅ SERVERLESS-COMPATIBLE: Uses file buffers only, no local storage
 * ✅ VERCEL-READY: No file system dependencies
 * ✅ MEMORY-EFFICIENT: Processes files in memory and cleans up immediately
 * 
 * Features:
 * - PDF upload via form data (no local storage)
 * - OCR processing via Mistral API
 * - Chat conversations with context from uploaded documents
 * - Streaming responses for better UX
 * - Automatic cleanup of temporary files
 */

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
})

const defaultLLM = new ChatOpenAI({
  model: "google/gemini-2.5-flash",
  apiKey: process.env.DEEPINFRA_API_KEY,
  temperature: 0.7,
  streaming: true,
  configuration: {
    baseURL: "https://api.deepinfra.com/v1/openai"
  }
})

// GET - Get chat history for a notebook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase()

    const { id: notebookId } = await params

    // Find chat thread for this notebook
    const chatThread = await ChatThread.findOne({
      notebookId,
      userId: payload.userId
    })

    if (!chatThread) {
      return NextResponse.json({
        success: true,
        messages: [],
        threadId: null
      })
    }

    return NextResponse.json({
      success: true,
      messages: chatThread.messages,
      threadId: chatThread.threadId,
      hasUploadedContent: !!chatThread.uploadedFileContent
    })

  } catch (error) {
    console.error('Get chat history error:', error)
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    )
  }
}

// POST - Send message or upload file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase()

    const { id: notebookId } = await params
    const contentType = request.headers.get('content-type')

    // Handle file upload
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
      }

      // Check file size (limit to 50MB for serverless environments)
      const maxFileSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxFileSize) {
        return NextResponse.json({ 
          error: 'File too large. Maximum size is 50MB' 
        }, { status: 400 })
      }

      let uploadedFileId: string | null = null

      try {
        console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`)

        // Process OCR using Mistral (serverless-compatible - no local storage)
        const fileBuffer = await file.arrayBuffer()
        
        // Upload directly to Mistral OCR service
        const uploadedFile = await mistralClient.files.upload({
          file: {
            fileName: file.name,
            content: new Uint8Array(fileBuffer),
          },
          purpose: "ocr",
        })
        
        uploadedFileId = uploadedFile.id
        console.log(`File uploaded to Mistral with ID: ${uploadedFileId}`)

        // Wait for file processing with timeout
        const maxWaitTime = 30000 // 30 seconds
        const startTime = Date.now()
        
        while (Date.now() - startTime < maxWaitTime) {
          try {
            await mistralClient.files.retrieve({
              fileId: uploadedFileId
            })
            break
          } catch (error) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }

        // Get signed URL for OCR processing
        const signedUrl = await mistralClient.files.getSignedUrl({
          fileId: uploadedFileId,
        })

        console.log('Starting OCR processing...')

        // Process OCR
        const ocrResponse = await mistralClient.ocr.process({
          model: "mistral-ocr-latest",
          document: {
            type: "document_url",
            documentUrl: signedUrl.url,
          }
        })

        const extractedText = ocrResponse.pages.map(page => page.markdown).join('\n\n')

        if (!extractedText.trim()) {
          throw new Error('No text could be extracted from the PDF')
        }

        console.log(`OCR completed. Extracted ${extractedText.length} characters from ${ocrResponse.pages.length} pages`)

        // Find or create chat thread
        let chatThread = await ChatThread.findOne({
          notebookId,
          userId: payload.userId
        })

        if (!chatThread) {
          const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          chatThread = new ChatThread({
            threadId,
            userId: payload.userId,
            notebookId,
            messages: [],
            uploadedFileContent: extractedText,
            title: `Chat for ${file.name}`
          })
        } else {
          // Update with new content
          chatThread.uploadedFileContent = extractedText
          chatThread.updatedAt = new Date()
        }

        await chatThread.save()

        return NextResponse.json({
          success: true,
          message: 'File uploaded and processed successfully',
          threadId: chatThread.threadId,
          pagesProcessed: ocrResponse.pages.length,
          charactersExtracted: extractedText.length
        })

      } catch (error) {
        console.error('OCR processing failed:', error)
        return NextResponse.json({ 
          error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 500 })
      } finally {
        // Always clean up uploaded file from Mistral (even on error)
        if (uploadedFileId) {
          try {
            await mistralClient.files.delete({ fileId: uploadedFileId })
            console.log(`Cleaned up file: ${uploadedFileId}`)
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError)
          }
        }
      }
    }

    // Handle chat message
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Find or create chat thread
    let chatThread = await ChatThread.findOne({
      notebookId,
      userId: payload.userId
    })

    if (!chatThread) {
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      chatThread = new ChatThread({
        threadId,
        userId: payload.userId,
        notebookId,
        messages: [],
        title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      })
    }

    // Add user message
    chatThread.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Prepare messages for LLM
    const systemMessage = new SystemMessage(`You are an AI assistant helping with a notebook. You have access to uploaded document content that you can reference to answer questions. Be helpful, accurate, and conversational.

${chatThread.uploadedFileContent ? `Document Content:
${chatThread.uploadedFileContent}

Use this content to answer questions when relevant, but also engage in general conversation about the notebook and learning topics.` : 'No document has been uploaded yet. Help the user with general questions about their notebook and learning.'}`)

    // Convert chat history to LangChain messages
    const messages = [systemMessage]
    
    // Add conversation history (but limit to last 10 messages to prevent token overflow)
    const recentMessages = chatThread.messages.slice(-10)
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content))
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content))
      }
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamResponse = await defaultLLM.stream(messages)
          
          let assistantResponse = ''
          
          for await (const chunk of streamResponse) {
            const content = chunk.content
            if (content) {
              assistantResponse += content
              const data = JSON.stringify({ content }) + '\n'
              controller.enqueue(encoder.encode(`data: ${data}`))
            }
          }

          // Save assistant response to chat thread
          chatThread.messages.push({
            role: 'assistant',
            content: assistantResponse,
            timestamp: new Date()
          })
          
          chatThread.updatedAt = new Date()
          await chatThread.save()

          // Send final message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n`))
          controller.close()

        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

// DELETE - Clear chat history
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase()

    const { id: notebookId } = await params

    await ChatThread.deleteOne({
      notebookId,
      userId: payload.userId
    })

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared'
    })

  } catch (error) {
    console.error('Clear chat error:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}
