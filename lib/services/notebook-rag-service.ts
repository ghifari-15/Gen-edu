import { QdrantClient } from '@qdrant/js-client-rest'
import EmbeddingService from '@/lib/services/embedding-service'
import { ocrService, OCRProcessResult } from '@/lib/services/ocr-service'
import { ChatOpenAI } from '@langchain/openai'

export interface NotebookRAGDocument {
  id: string
  content: string
  cellType: 'markdown' | 'code' | 'text'
  cellIndex: number
  notebookId: string
  userId: string
  metadata: {
    title?: string
    tags?: string[]
    createdAt: string
    updatedAt: string
  }
}

export interface NotebookRAGResult {
  answer: string
  sources: {
    content: string
    cellType: string
    cellIndex: number
    similarity: number
    metadata?: any
  }[]
  confidence: number
}

class NotebookRAGService {
  private qdrantClient: QdrantClient
  private embeddingService: EmbeddingService
  private defaultLLM: ChatOpenAI

  constructor() {
    // Initialize Qdrant client with cloud endpoint
    this.qdrantClient = new QdrantClient({
      url: 'https://8ba170ec-aa3a-4511-b5b6-11e2cc995825.us-west-1-0.aws.cloud.qdrant.io:6333',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ur78MYScaF0GGK3SC0U56q7oRvXlv-uimK4SuvBJjII',
    })
    this.embeddingService = new EmbeddingService()
    
    // Initialize LLM instances
    this.defaultLLM = new ChatOpenAI({
      model: "anthropic/claude-3-7-sonnet-latest",
      apiKey: process.env.DEEPINFRA_API_KEY,
      temperature: 0.7,
      streaming: true,
      configuration: {
        baseURL: "https://api.deepinfra.com/v1/openai"
      }
    })
  }

  // Generate collection name for a specific notebook
  private getCollectionName(notebookId: string, userId: string): string {
    return `notebook_${userId}_${notebookId}`.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  // Create a new collection for a notebook
  async createNotebookCollection(notebookId: string, userId: string): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      
      // Check if collection already exists
      const exists = await this.qdrantClient.collectionExists(collectionName)
      if (exists) {
        return true
      }

      // Create collection with dense vectors for embeddings
      await this.qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 4096, // Qwen3-Embedding-4B dimension (updated)
          distance: 'Cosine'
        }
      })

      console.log(`Created collection: ${collectionName}`)
      return true
    } catch (error) {
      console.error('Failed to create notebook collection:', error)
      return false
    }
  }

  // Delete a notebook collection
  async deleteNotebookCollection(notebookId: string, userId: string): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      await this.qdrantClient.deleteCollection(collectionName)
      console.log(`Deleted collection: ${collectionName}`)
      return true
    } catch (error) {
      console.error('Failed to delete notebook collection:', error)
      return false
    }
  }

  // Add or update content from a notebook cell
  async addCellContent(
    notebookId: string,
    userId: string,
    cellId: string,
    content: string,
    cellType: 'markdown' | 'code' | 'text',
    cellIndex: number,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      
      // Ensure collection exists
      await this.createNotebookCollection(notebookId, userId)

      // Skip empty content
      if (!content.trim()) {
        return true
      }

      // Generate embedding using Qwen3-Embedding-4B
      const embedding = await this.embeddingService.generateEmbedding(content)
      if (!embedding) {
        console.error('Failed to generate embedding for cell content')
        return false
      }

      // Create point for the cell
      const point = {
        id: cellId,
        vector: embedding,
        payload: {
          content,
          cellType,
          cellIndex,
          notebookId,
          userId,
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }

      // Upsert the point (insert or update)
      await this.qdrantClient.upsert(collectionName, {
        points: [point]
      })

      return true
    } catch (error) {
      console.error('Failed to add cell content to RAG:', error)
      return false
    }
  }

  // Remove content for a specific cell
  async removeCellContent(
    notebookId: string,
    userId: string,
    cellId: string
  ): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      
      await this.qdrantClient.delete(collectionName, {
        points: [cellId]
      })

      return true
    } catch (error) {
      console.error('Failed to remove cell content from RAG:', error)
      return false
    }
  }

  // Query the notebook's RAG system
  async queryNotebook(
    notebookId: string,
    userId: string,
    question: string,
    limit: number = 5
  ): Promise<NotebookRAGResult> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      
      // Check if collection exists
      const exists = await this.qdrantClient.collectionExists(collectionName)
      if (!exists) {
        return {
          answer: "This notebook doesn't have any content indexed yet. Add some content to your notebook cells to enable RAG search.",
          sources: [],
          confidence: 0
        }
      }

      // Generate embedding for the question
      const queryEmbedding = await this.embeddingService.generateEmbedding(question)
      if (!queryEmbedding) {
        return {
          answer: "I'm sorry, I couldn't process your question. Please try again.",
          sources: [],
          confidence: 0
        }
      }

      // Search for similar content in the notebook
      const searchResult = await this.qdrantClient.query(collectionName, {
        query: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: 0.3 // Minimum similarity threshold
      })

      const points = searchResult.points || []

      if (!points.length) {
        return {
          answer: "I couldn't find relevant content in this notebook to answer your question. Try asking about topics covered in your notebook cells.",
          sources: [],
          confidence: 0
        }
      }

      // Format sources
      const sources = points.map((result: any) => ({
        content: result.payload?.content || '',
        cellType: result.payload?.cellType || 'text',
        cellIndex: result.payload?.cellIndex || 0,
        similarity: result.score || 0,
        metadata: result.payload?.metadata
      }))

      // Generate answer using the found context
      const answer = await this.generateAnswer(question, points)
      const confidence = this.calculateConfidence(points)

      return {
        answer,
        sources,
        confidence
      }
    } catch (error) {
      console.error('Notebook RAG query failed:', error)
      return {
        answer: "I encountered an error while searching your notebook. Please try again.",
        sources: [],
        confidence: 0
      }
    }
  }

  // Update all content for a notebook (useful for full reindexing)
  async reindexNotebook(
    notebookId: string,
    userId: string,
    cells: Array<{
      id: string
      content: string
      type: 'markdown' | 'code' | 'text'
      index: number
    }>,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      // Delete existing collection
      await this.deleteNotebookCollection(notebookId, userId)
      
      // Create new collection
      await this.createNotebookCollection(notebookId, userId)
      
      // Add all cells
      for (const cell of cells) {
        if (cell.content.trim()) {
          await this.addCellContent(
            notebookId,
            userId,
            cell.id,
            cell.content,
            cell.type,
            cell.index,
            metadata
          )
        }
      }

      return true
    } catch (error) {
      console.error('Failed to reindex notebook:', error)
      return false
    }
  }

  // Generate answer using Claude 3.5 Sonnet via DeepInfra
  private async generateAnswer(question: string, searchResults: any[]): Promise<string> {
    if (searchResults.length === 0) {
      return "I don't have sufficient information in this notebook to answer your question."
    }

    // Prepare context from retrieved notebook cells
    const context = searchResults.map((result, index) => {
      const payload = result.payload
      const cellType = payload?.cellType || 'text'
      const cellIndex = payload?.cellIndex || 0
      const content = payload?.content || ''
      
      return `Cell ${cellIndex + 1} (${cellType}):\n${content}`
    }).join('\n\n---\n\n')

    // Create prompt for Claude
    const prompt = `You are an AI assistant helping a user understand their notebook content. Answer the user's question based only on the content from their notebook cells provided below.

Notebook Content:
${context}

User Question: ${question}

Instructions:
- Answer based only on the notebook content provided above
- Be concise but informative
- Reference specific cells when relevant (e.g., "According to Cell 2...")
- If the notebook content doesn't contain enough information, say so clearly
- Format your answer in a clear, educational manner
- Help the user understand their own notebook content

Answer:`

    try {
      // Use Claude via DeepInfra API
      const response = await this.defaultLLM.invoke([
        {
          role: 'system',
          content: 'You are a helpful assistant that helps users understand their notebook content. Answer questions based only on the provided notebook cells.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ])

      if (response && response.content) {
        return response.content.toString().trim()
      }
    } catch (error) {
      console.error('Claude generation failed:', error)
    }

    // Fallback to simple answer if LLM fails
    const topResult = searchResults[0]
    const payload = topResult.payload
    const cellType = payload?.cellType || 'text'
    const cellIndex = payload?.cellIndex || 0
    const content = payload?.content || ''

    return `Based on Cell ${cellIndex + 1} (${cellType}) in your notebook:

${content.substring(0, 400)}${content.length > 400 ? '...' : ''}

This appears to be the most relevant content from your notebook. Would you like me to provide more details about any specific aspect?`
  }

  // Calculate confidence based on similarity scores
  private calculateConfidence(searchResults: any[]): number {
    if (searchResults.length === 0) return 0
    
    // Calculate average similarity score
    const scores = searchResults.map(result => result.score || 0)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    // Convert to confidence percentage
    return Math.min(Math.round(avgScore * 100), 100)
  }

  // Get collection info (useful for debugging)
  async getCollectionInfo(notebookId: string, userId: string) {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      const exists = await this.qdrantClient.collectionExists(collectionName)
      
      if (!exists) {
        return { exists: false, name: collectionName }
      }

      const info = await this.qdrantClient.getCollection(collectionName)
      return { exists: true, name: collectionName, info }
    } catch (error) {
      console.error('Failed to get collection info:', error)
      return { exists: false, name: this.getCollectionName(notebookId, userId), error }
    }
  }

  // Add PDF documents to notebook collection using OCR
  async addPDFDocuments(
    notebookId: string,
    userId: string,
    files: { buffer: Buffer; name: string }[]
  ): Promise<{ success: boolean; documentsAdded: number; chunks: number }> {
    try {
      console.log(`Processing ${files.length} PDF files for notebook ${notebookId}`)
      
      // Ensure collection exists
      await this.createNotebookCollection(notebookId, userId)
      
      let totalDocuments = 0
      let totalChunks = 0
      
      for (const file of files) {
        try {
          // Process PDF with OCR
          const ocrResult: OCRProcessResult = await ocrService.processPDF(file.buffer, file.name)
          
          // Split extracted text into chunks
          const textChunks = ocrService.splitTextIntoChunks(ocrResult.extractedText, 8000, 200)
          
          // Process each chunk
          for (let i = 0; i < textChunks.length; i++) {
            const chunkId = `pdf_${file.name}_${Date.now()}_chunk_${i}`
            
            await this.addCellContent(
              notebookId,
              userId,
              chunkId,
              textChunks[i],
              'text',
              totalChunks,
              {
                source: 'pdf',
                fileName: file.name,
                chunkIndex: i,
                totalChunks: textChunks.length,
                ocrFileId: ocrResult.fileId
              }
            )
            
            totalChunks++
          }
          
          totalDocuments++
          console.log(`Successfully processed PDF: ${file.name} (${textChunks.length} chunks)`
          )
          
        } catch (error) {
          console.error(`Failed to process PDF ${file.name}:`, error)
          // Continue with other files even if one fails
        }
      }
      
      return {
        success: true,
        documentsAdded: totalDocuments,
        chunks: totalChunks
      }
      
    } catch (error) {
      console.error('Failed to add PDF documents:', error)
      throw new Error(`Failed to add PDF documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Add text content directly to notebook collection
  async addTextContent(
    notebookId: string,
    userId: string,
    content: string,
    fileName: string = 'direct_input'
  ): Promise<{ success: boolean; chunks: number }> {
    try {
      // Ensure collection exists
      await this.createNotebookCollection(notebookId, userId)
      
      // Split text into chunks
      const textChunks = ocrService.splitTextIntoChunks(content, 8000, 200)
      
      let totalChunks = 0
      
      // Process each chunk
      for (let i = 0; i < textChunks.length; i++) {
        const chunkId = `text_${fileName}_${Date.now()}_chunk_${i}`
        
        await this.addCellContent(
          notebookId,
          userId,
          chunkId,
          textChunks[i],
          'text',
          totalChunks,
          {
            source: 'text',
            fileName,
            chunkIndex: i,
            totalChunks: textChunks.length
          }
        )
        
        totalChunks++
      }
      
      console.log(`Successfully added text content: ${fileName} (${textChunks.length} chunks)`)
      
      return {
        success: true,
        chunks: totalChunks
      }
      
    } catch (error) {
      console.error('Failed to add text content:', error)
      throw new Error(`Failed to add text content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Enhanced search with source filtering
  async searchDocuments(
    notebookId: string,
    userId: string,
    query: string,
    options: {
      limit?: number
      scoreThreshold?: number
      sourceFilter?: 'pdf' | 'text' | 'cell'
    } = {}
  ): Promise<{
    results: Array<{
      id: string
      content: string
      score: number
      source: string
      fileName?: string
      cellType?: string
      cellIndex?: number
    }>
    totalResults: number
  }> {
    try {
      const { limit = 5, scoreThreshold = 0.3, sourceFilter } = options
      const collectionName = this.getCollectionName(notebookId, userId)
      
      // Check if collection exists
      const exists = await this.qdrantClient.collectionExists(collectionName)
      if (!exists) {
        return { results: [], totalResults: 0 }
      }

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query)
      if (!queryEmbedding) {
        return { results: [], totalResults: 0 }
      }

      // Build filter for source type if specified
      let filter = undefined
      if (sourceFilter) {
        filter = {
          must: [
            {
              key: 'metadata.source',
              match: { value: sourceFilter }
            }
          ]
        }
      }

      // Search for similar content
      const searchResult = await this.qdrantClient.query(collectionName, {
        query: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: scoreThreshold,
        filter
      })

      const points = searchResult.points || []

      // Format results
      const results = points.map((result: any) => ({
        id: result.id.toString(),
        content: result.payload?.content || '',
        score: result.score || 0,
        source: result.payload?.metadata?.source || 'unknown',
        fileName: result.payload?.metadata?.fileName,
        cellType: result.payload?.cellType,
        cellIndex: result.payload?.cellIndex
      }))

      return {
        results,
        totalResults: results.length
      }
      
    } catch (error) {
      console.error('Document search failed:', error)
      return { results: [], totalResults: 0 }
    }
  }

  // Get notebook statistics including PDF documents
  async getNotebookStats(notebookId: string, userId: string): Promise<{
    totalCells: number
    totalPDFs: number
    totalTextDocuments: number
    totalChunks: number
    collectionExists: boolean
  }> {
    try {
      const collectionName = this.getCollectionName(notebookId, userId)
      const exists = await this.qdrantClient.collectionExists(collectionName)
      
      if (!exists) {
        return {
          totalCells: 0,
          totalPDFs: 0,
          totalTextDocuments: 0,
          totalChunks: 0,
          collectionExists: false
        }
      }

      // Get all points to analyze
      const scrollResult = await this.qdrantClient.scroll(collectionName, {
        limit: 10000,
        with_payload: true
      })

      const points = scrollResult.points || []
      
      let totalCells = 0
      let totalPDFs = 0
      let totalTextDocuments = 0
      const pdfFiles = new Set()
      const textFiles = new Set()

      for (const point of points) {
        const source = (point.payload as any)?.metadata?.source
        const fileName = (point.payload as any)?.metadata?.fileName
        
        if (source === 'pdf' && fileName) {
          pdfFiles.add(fileName)
        } else if (source === 'text' && fileName) {
          textFiles.add(fileName)
        } else {
          totalCells++
        }
      }

      return {
        totalCells,
        totalPDFs: pdfFiles.size,
        totalTextDocuments: textFiles.size,
        totalChunks: points.length,
        collectionExists: true
      }
      
    } catch (error) {
      console.error('Failed to get notebook stats:', error)
      return {
        totalCells: 0,
        totalPDFs: 0,
        totalTextDocuments: 0,
        totalChunks: 0,
        collectionExists: false
      }
    }
  }
}

export default NotebookRAGService
