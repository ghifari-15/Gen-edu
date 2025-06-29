import VectorDatabase, { KnowledgeVector } from '@/lib/database/vector-database'
import EmbeddingService from '@/lib/services/embedding-service'

export interface RAGResult {
  answer: string
  sources: {
    title: string
    content: string
    category: string
    similarity: number
  }[]
  confidence: number
}

class RAGService {
  private vectorDB: VectorDatabase
  private embeddingService: EmbeddingService

  constructor() {
    this.vectorDB = new VectorDatabase()
    this.embeddingService = new EmbeddingService()
  }

  async addKnowledgeToRAG(knowledge: {
    title: string
    content: string
    category: string
    tags: string[]
    source: string
  }): Promise<string | null> {
    try {
      // Generate embedding for the content
      const embedding = await this.embeddingService.generateEmbedding(knowledge.content)
      
      if (!embedding) {
        console.error('Failed to generate embedding for knowledge')
        return null
      }

      // Create vector document
      const vectorDoc: Omit<KnowledgeVector, '_id'> = {
        text: knowledge.content,
        title: knowledge.title,
        category: knowledge.category,
        tags: knowledge.tags,
        embedding: embedding,
        metadata: {
          source: knowledge.source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      // Add to vector database
      const id = await this.vectorDB.addVector(vectorDoc)
      return id
    } catch (error) {
      console.error('Failed to add knowledge to RAG:', error)
      return null
    }
  }

  async queryRAG(question: string, limit: number = 5): Promise<RAGResult> {
    try {
      // Generate embedding for the question
      const queryEmbedding = await this.embeddingService.generateEmbedding(question)
      
      if (!queryEmbedding) {
        return {
          answer: "I'm sorry, I couldn't process your question. Please try again.",
          sources: [],
          confidence: 0
        }
      }

      // Search for similar knowledge
      const similarDocs = await this.vectorDB.searchSimilar(queryEmbedding, limit, 0.3)
      
      if (similarDocs.length === 0) {
        // Check if it's a basic greeting or casual question
        const isBasicGreeting = this.isBasicGreeting(question)
        
        // Fallback to text search
        const textResults = await this.vectorDB.textSearch(question, limit)
        if (textResults.length > 0) {
          // Use text search results
          const sources = textResults.map(doc => ({
            title: doc.title,
            content: doc.text.substring(0, 200) + '...',
            category: doc.category,
            similarity: 0.5 // Default similarity for text search
          }))

          const answer = await this.generateAnswer(question, textResults)
          return {
            answer,
            sources,
            confidence: 50 // Lower confidence for text search
          }
        }
        
        // If it's a basic greeting, respond naturally without mentioning knowledge base
        if (isBasicGreeting) {
          return {
            answer: await this.generateAnswer(question, []), // This will use the LLM for basic responses
            sources: [],
            confidence: 80 // High confidence for basic greetings
          }
        }
        
        // For specific questions that need knowledge base
        return {
          answer: `Maaf, saya tidak menemukan informasi spesifik untuk pertanyaan Anda di knowledge base saat ini. 

Bisakah Anda:
• Mencoba kata kunci yang berbeda?
• Memberikan lebih detail tentang topik yang Anda tanyakan?
• Atau mungkin saya bisa membantu dengan topik pembelajaran lainnya?

Saya di sini untuk mendukung perjalanan belajar Anda! Ada yang bisa saya bantu hari ini? 😊`,
          sources: [],
          confidence: 0
        }
      }

      // Format sources
      const sources = similarDocs.map(doc => ({
        title: doc.title,
        content: doc.text.substring(0, 200) + '...',
        category: doc.category,
        similarity: (doc as KnowledgeVector & { score?: number }).score || 0
      }))

      // Generate answer based on retrieved context
      const answer = await this.generateAnswer(question, similarDocs)
      const confidence = this.calculateConfidence(similarDocs)

      return {
        answer,
        sources,
        confidence
      }
    } catch (error) {
      console.error('RAG query failed:', error)
      return {
        answer: "I encountered an error while processing your question. Please try again.",
        sources: [],
        confidence: 0
      }
    }
  }

  /**
   * Stream RAG query - returns an async generator that yields chunks of the response
   */
  async* queryRAGStream(question: string, limit: number = 5): AsyncGenerator<{
    chunk: string;
    sources?: any[];
    confidence?: number;
    isComplete?: boolean;
  }, void, unknown> {
    try {
      // Generate embedding for the question
      const queryEmbedding = await this.embeddingService.generateEmbedding(question)
      
      if (!queryEmbedding) {
        yield {
          chunk: "I'm sorry, I couldn't process your question. Please try again.",
          sources: [],
          confidence: 0,
          isComplete: true
        }
        return
      }

      // Search for similar knowledge
      const similarDocs = await this.vectorDB.searchSimilar(queryEmbedding, limit, 0.3)
      
      let docs = similarDocs
      let confidence = 0
      
      if (similarDocs.length === 0) {
        // Check if it's a basic greeting or casual question
        const isBasicGreeting = this.isBasicGreeting(question)
        
        // Fallback to text search
        const textResults = await this.vectorDB.textSearch(question, limit)
        if (textResults.length > 0) {
          docs = textResults
          confidence = 50 // Lower confidence for text search
        } else if (isBasicGreeting) {
          docs = []
          confidence = 80 // High confidence for basic greetings
        } else {
          // No relevant docs found and not a greeting
          yield {
            chunk: `Maaf, saya tidak menemukan informasi spesifik untuk pertanyaan Anda di knowledge base saat ini. 

Bisakah Anda:
• Mencoba kata kunci yang berbeda?
• Memberikan lebih detail tentang topik yang Anda tanyakan?
• Atau mungkin saya bisa membantu dengan topik pembelajaran lainnya?

Saya di sini untuk mendukung perjalanan belajar Anda! Ada yang bisa saya bantu hari ini? 😊`,
            sources: [],
            confidence: 0,
            isComplete: true
          }
          return
        }
      } else {
        confidence = this.calculateConfidence(similarDocs)
      }

      // Format sources
      const sources = docs.map(doc => ({
        title: doc.title,
        content: doc.text.substring(0, 200) + '...',
        category: doc.category,
        similarity: (doc as KnowledgeVector & { score?: number }).score || 0
      }))
      
      // Yield initial metadata
      yield {
        chunk: '',
        sources,
        confidence,
        isComplete: false
      }
      
      // Stream the answer
      for await (const chunk of this.generateStreamingAnswer(question, docs)) {
        yield {
          chunk,
          isComplete: false
        }
      }
      
      // Yield completion signal
      yield {
        chunk: '',
        isComplete: true
      }
    } catch (error) {
      console.error('RAG streaming query error:', error)
      
      // Yield error fallback
      yield {
        chunk: 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi atau hubungi support jika masalah berlanjut.',
        sources: [],
        confidence: 0,
        isComplete: true
      }
    }
  }

  private async generateAnswer(question: string, docs: any[]): Promise<string> {
    // Get current date and time for real-time context
    const currentDate = new Date()
    const dateString = currentDate.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeString = currentDate.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    })

    // Prepare context from retrieved documents
    const context = docs.length > 0 
      ? docs.map((doc, index) => 
          `Document ${index + 1} - ${doc.title} (${doc.category}):\n${doc.text}`
        ).join('\n\n---\n\n')
      : ''

    // Create comprehensive system prompt
    const systemPrompt = `You are GenEdu Agent, a friendly and intelligent AI learning assistant for the GenEdu educational platform.

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

CORE PERSONALITY:
- Warm, helpful, and encouraging learning companion
- Respond naturally to greetings (e.g., "Halo! Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?")
- Always maintain a positive, patient, and educational tone
- Adapt your communication style to match the user (formal/informal, Indonesian/English)
- Be conversational and supportive while being educational

KNOWLEDGE BASE CONTEXT:
${docs.length > 0 ? `✅ Found ${docs.length} relevant document(s) from the knowledge base` : '⚠️ No specific documents found in knowledge base'}

RESPONSE INSTRUCTIONS:
- ALWAYS provide a helpful response, regardless of available context
- If you have relevant knowledge base context, use it to provide detailed, accurate answers
- If context is limited or not found, still provide general educational guidance and offer to help further
- For greetings or casual conversations, respond naturally and warmly
- Answer in the same language as the question (Indonesian/English)
- Be encouraging about learning and studying
- If you're unsure, admit it honestly but still try to be helpful

CONTEXT HANDLING:
- When context is available: Reference specific materials and provide detailed explanations
- When context is limited: Provide general knowledge while noting limitations
- When no context: Still be helpful with general educational support and guidance
- Never refuse to answer due to lack of context - always try to assist in some way

FORMAT:
- Keep responses clear and well-structured
- Use bullet points or numbered lists when helpful
- Include encouraging remarks about learning progress when appropriate`

    // Create user prompt with context
    const userPrompt = docs.length > 0 
      ? `KNOWLEDGE BASE CONTEXT:
${context}

USER QUESTION: ${question}

Please answer based on the available context above. If the context doesn't fully answer the question, provide what you can from the context and supplement with general educational guidance.`
      : `USER QUESTION: ${question}

No specific context was found in the knowledge base for this question. Please provide a helpful general response and encourage the user about their learning journey.`

    try {
      // Use DeepInfra API to generate answer
      const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPINFRA_TOKEN}`
        },
        body: JSON.stringify({
          model: 'anthropic/claude-4-sonnet',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const answer = data.choices?.[0]?.message?.content?.trim()
        
        if (answer) {
          return answer
        }
      }
    } catch (error) {
      console.error('LLM generation failed:', error)
    }

    // Fallback to simple answer if LLM fails
    if (docs.length === 0) {
      // Check if it's a basic greeting
      if (this.isBasicGreeting(question)) {
        return `Halo! Senang bertemu dengan Anda. Saya GenEdu Agent, asisten pembelajaran AI yang siap membantu Anda belajar! 

Saya bisa membantu dengan:
• Menjelaskan konsep-konsep pembelajaran
• Menjawab pertanyaan akademik
• Memberikan tips belajar
• Membuat kuis dan latihan

Ada yang bisa saya bantu untuk pembelajaran Anda hari ini? 😊`
      }
      
      return `Maaf, saya tidak menemukan informasi spesifik untuk pertanyaan Anda di knowledge base. Namun, saya tetap ingin membantu! 

Bisakah Anda:
- Memberikan lebih detail tentang topik yang Anda tanyakan?
- Mencoba kata kunci yang berbeda?
- Atau mungkin saya bisa membantu dengan topik pembelajaran lainnya?

Saya di sini untuk mendukung perjalanan belajar Anda! 😊`
    }

    const topDoc = docs[0]
    return `Berdasarkan informasi yang tersedia tentang "${topDoc.title}":

${topDoc.text.substring(0, 400)}${topDoc.text.length > 400 ? '...' : ''}

Informasi ini berasal dari knowledge base ${topDoc.category} kami. Apakah Anda ingin saya memberikan detail lebih lanjut tentang aspek tertentu?`
  }

  /**
   * Generate streaming answer for a question using retrieved documents
   * Returns an async generator that yields chunks of the response
   */
  private async* generateStreamingAnswer(question: string, docs: any[]): AsyncGenerator<string, void, unknown> {
    // Get current date and time for real-time context
    const currentDate = new Date()
    const dateString = currentDate.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeString = currentDate.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    })

    // Prepare context from retrieved documents
    const context = docs.length > 0 
      ? docs.map((doc, index) => 
          `Document ${index + 1} - ${doc.title} (${doc.category}):\n${doc.text}`
        ).join('\n\n---\n\n')
      : ''

    // Create comprehensive system prompt
    const systemPrompt = `You are GenEdu Agent, a friendly and intelligent AI learning assistant for the GenEdu educational platform.

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

CORE PERSONALITY:
- Warm, helpful, and encouraging learning companion
- Respond naturally to greetings (e.g., "Halo! Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?")
- Always maintain a positive, patient, and educational tone
- Adapt your communication style to match the user (formal/informal, Indonesian/English)
- Be conversational and supportive while being educational

KNOWLEDGE BASE CONTEXT:
${docs.length > 0 ? `✅ Found ${docs.length} relevant document(s) from the knowledge base` : '⚠️ No specific documents found in knowledge base'}

RESPONSE INSTRUCTIONS:
- ALWAYS provide a helpful response, regardless of available context
- If you have relevant knowledge base context, use it to provide detailed, accurate answers
- If context is limited or not found, still provide general educational guidance and offer to help further
- For greetings or casual conversations, respond naturally and warmly
- Answer in the same language as the question (Indonesian/English)
- Be encouraging about learning and studying
- If you're unsure, admit it honestly but still try to be helpful

CONTEXT HANDLING:
- When context is available: Reference specific materials and provide detailed explanations
- When context is limited: Provide general knowledge while noting limitations
- When no context: Still be helpful with general educational support and guidance
- Never refuse to answer due to lack of context - always try to assist in some way

FORMAT:
- Keep responses clear and well-structured
- Use bullet points or numbered lists when helpful
- Include encouraging remarks about learning progress when appropriate`

    // Create user prompt with context
    const userPrompt = docs.length > 0 
      ? `KNOWLEDGE BASE CONTEXT:
${context}

USER QUESTION: ${question}

Please answer based on the available context above. If the context doesn't fully answer the question, provide what you can from the context and supplement with general educational guidance.`
      : `USER QUESTION: ${question}

No specific context was found in the knowledge base for this question. Please provide a helpful general response and encourage the user about their learning journey.`

    try {
      // Use DeepInfra API to generate streaming answer
      const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPINFRA_TOKEN}`
        },
        body: JSON.stringify({
          model: 'anthropic/claude-4-sonnet',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
          stream: true
        })
      })

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                
                if (data === '[DONE]') {
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  
                  if (content) {
                    yield content
                  }
                } catch (parseError) {
                  // Skip invalid JSON lines
                  continue
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      } else {
        // If streaming fails, fall back to non-streaming response
        const answer = await this.generateAnswer(question, docs)
        // Yield the fallback answer as chunks to maintain consistency
        const words = answer.split(' ')
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' '
          yield chunk
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    } catch (error) {
      console.error('Streaming LLM generation failed:', error)
      
      // Fallback to simple answer if LLM fails
      let fallbackAnswer = ''
      
      if (docs.length === 0) {
        // Check if it's a basic greeting
        if (this.isBasicGreeting(question)) {
          fallbackAnswer = `Halo! Senang bertemu dengan Anda. Saya GenEdu Agent, asisten pembelajaran AI yang siap membantu Anda belajar! 

Saya bisa membantu dengan:
• Menjelaskan konsep-konsep pembelajaran
• Menjawab pertanyaan akademik
• Memberikan tips belajar
• Membuat kuis dan latihan

Ada yang bisa saya bantu untuk pembelajaran Anda hari ini? 😊`
        } else {
          fallbackAnswer = `Maaf, saya tidak menemukan informasi spesifik untuk pertanyaan Anda di knowledge base. Namun, saya tetap ingin membantu! 

Bisakah Anda:
- Memberikan lebih detail tentang topik yang Anda tanyakan?
- Mencoba kata kunci yang berbeda?
- Atau mungkin saya bisa membantu dengan topik pembelajaran lainnya?

Saya di sini untuk mendukung perjalanan belajar Anda! 😊`
        }
      } else {
        const topDoc = docs[0]
        fallbackAnswer = `Berdasarkan informasi yang tersedia tentang "${topDoc.title}":

${topDoc.text.substring(0, 400)}${topDoc.text.length > 400 ? '...' : ''}

Informasi ini berasal dari knowledge base ${topDoc.category} kami. Apakah Anda ingin saya memberikan detail lebih lanjut tentang aspek tertentu?`
      }
      
      // Yield the fallback answer as chunks
      const words = fallbackAnswer.split(' ')
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' '
        yield chunk
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }

  private calculateConfidence(docs: any[]): number {
    if (docs.length === 0) return 0
    
    // Calculate average similarity score
    const scores = docs.map(doc => doc.score || 0)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    // Convert to confidence percentage
    return Math.min(avgScore * 100, 100)
  }

  async updateKnowledge(id: string, updates: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
  }): Promise<boolean> {
    try {
      let vectorUpdates: any = { ...updates }

      // If content is updated, regenerate embedding
      if (updates.content) {
        const newEmbedding = await this.embeddingService.generateEmbedding(updates.content)
        if (newEmbedding) {
          vectorUpdates.embedding = newEmbedding
          vectorUpdates.text = updates.content
        }
      }

      return await this.vectorDB.updateVector(id, vectorUpdates)
    } catch (error) {
      console.error('Failed to update knowledge in RAG:', error)
      return false
    }
  }

  async deleteKnowledge(id: string): Promise<boolean> {
    try {
      return await this.vectorDB.deleteVector(id)
    } catch (error) {
      console.error('Failed to delete knowledge from RAG:', error)
      return false
    }
  }

  async close() {
    await this.vectorDB.close()
  }

  /**
   * Check if the question is a basic greeting or casual conversation
   */
  private isBasicGreeting(question: string): boolean {
    const lowerQuestion = question.toLowerCase().trim()
    
    // Common greetings and basic questions
    const greetingPatterns = [
      // Indonesian greetings
      'halo', 'hai', 'hi', 'hello', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
      'apa kabar', 'gimana', 'bagaimana', 'terima kasih', 'thanks', 'thank you',
      
      // Basic questions
      'siapa kamu', 'who are you', 'apa itu', 'what is', 'bantuan', 'help',
      'bisa bantu', 'can you help', 'tolong', 'please', 'maaf', 'sorry',
      
      // Simple responses
      'ok', 'oke', 'baik', 'good', 'ya', 'yes', 'tidak', 'no', 'tidak apa-apa',
      
      // Basic conversation
      'test', 'testing', 'coba', 'cobain'
    ]
    
    // Check if question is very short (likely a greeting)
    if (lowerQuestion.length <= 15) {
      return true
    }
    
    // Check if question contains greeting patterns
    return greetingPatterns.some(pattern => lowerQuestion.includes(pattern))
  }
}

export default RAGService
