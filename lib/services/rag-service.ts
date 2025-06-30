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

export interface ConversationMemory {
  question: string
  answer: string
  timestamp: Date
  sources?: any[]
  confidence?: number
}

export interface RAGOptions {
  includeMemory?: boolean
  memoryLimit?: number
}

class RAGService {
  private vectorDB: VectorDatabase
  private embeddingService: EmbeddingService
  private maxMemorySize: number = 10 // Maximum number of conversations to remember
  
  // Static memory storage that persists across instances
  private static globalConversationMemory: ConversationMemory[] = []

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

  async queryRAG(question: string, limit: number = 5, options: RAGOptions = {}): Promise<RAGResult> {
    const { includeMemory = true } = options
    
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
      
      let docs = similarDocs
      let confidence = 0
      
      if (similarDocs.length === 0) {
        // Fallback to text search
        const textResults = await this.vectorDB.textSearch(question, limit)
        if (textResults.length > 0) {
          docs = textResults
          confidence = 50 // Lower confidence for text search
        } else {
          // No relevant knowledge found - let LLM answer with general knowledge
          docs = []
          confidence = 30 // General knowledge confidence
        }
      } else {
        confidence = this.calculateConfidence(similarDocs)
      }

      // Format sources (if any)
      const sources = docs.map(doc => ({
        title: doc.title,
        content: doc.text.substring(0, 200) + '...',
        category: doc.category,
        similarity: (doc as KnowledgeVector & { score?: number }).score || 0
      }))

      // Generate answer (LLM will handle both cases: with or without context)
      const answer = await this.generateAnswer(question, docs, includeMemory)

      // Add to memory
      if (includeMemory) {
        this.addToMemory(question, answer, sources, confidence)
      }

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
  async* queryRAGStream(question: string, limit: number = 5, options: RAGOptions = {}): AsyncGenerator<{
    chunk: string;
    sources?: any[];
    confidence?: number;
    isComplete?: boolean;
  }, void, unknown> {
    const { includeMemory = true } = options
    
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
      let answer = ''
      
      if (similarDocs.length === 0) {
        // Fallback to text search
        const textResults = await this.vectorDB.textSearch(question, limit)
        if (textResults.length > 0) {
          docs = textResults
          confidence = 50 // Lower confidence for text search
        } else {
          // No relevant knowledge found - let LLM answer with general knowledge
          docs = []
          confidence = 30 // General knowledge confidence
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
      for await (const chunk of this.generateStreamingAnswer(question, docs, includeMemory)) {
        answer += chunk
        yield {
          chunk,
          isComplete: false
        }
      }
      
      // Add to memory
      if (includeMemory) {
        this.addToMemory(question, answer, sources, confidence)
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

  private async generateAnswer(question: string, docs: any[], includeMemory: boolean = true): Promise<string> {
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

    // Get conversation memory context
    const memoryContext = includeMemory ? this.getConversationContext() : ''

    // Create comprehensive system prompt
    const systemPrompt = `You are GenEdu Agent, a friendly and intelligent AI learning assistant for the GenEdu educational platform.

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

${memoryContext ? `CONVERSATION HISTORY:
${memoryContext}

` : ''}CORE PERSONALITY:
- Warm, helpful, and encouraging learning companion
- Respond naturally to greetings (e.g., "Halo! Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?")
- Always maintain a positive, patient, and educational tone
- Adapt your communication style to match the user (formal/informal, Indonesian/English)
- Be conversational and supportive while being educational
- Reference previous conversations when relevant to provide continuity

KNOWLEDGE BASE CONTEXT:
${docs.length > 0 ? `✅ Found ${docs.length} relevant document(s) from the knowledge base` : '⚠️ No specific documents found in knowledge base'}

CRITICAL INSTRUCTION - UNDERSTANDING AND SUMMARIZING:
🚨 NEVER copy or paste raw data from the knowledge base documents
🚨 ALWAYS understand the content first, then provide a summary that directly answers the user's question
🚨 Process the information and present it in your own words, tailored to what the user is asking
🚨 **IMPORTANT**: If no knowledge base context is available, answer using your general knowledge as an educational assistant
🚨 **NEVER refuse to answer** - always provide helpful educational content regardless of knowledge base availability

RESPONSE INSTRUCTIONS:
- **PRIMARY GOAL**: Answer the user's question helpfully and naturally
- If knowledge base context is available: READ, UNDERSTAND, and SYNTHESIZE the information  
- If no knowledge base context: Use your general educational knowledge to provide helpful content
- For any question (academic, casual, greeting), provide a natural, helpful response
- Answer in the same language as the question (Indonesian/English)
- Be encouraging about learning and studying
- Use conversation history to provide personalized and contextual responses
- Reference previous topics when relevant to show understanding and continuity

CONTEXT HANDLING:
- **With context**: UNDERSTAND the knowledge base materials and provide clear explanations
- **Without context**: Provide general educational knowledge while being transparent about the source
- **Never refuse**: Always try to assist in some educational way, even for general questions
- Use conversation history to understand follow-up questions and provide continuity

FORMAT GUIDELINES:
- Keep responses clear and well-structured
- Use bullet points (•) with proper spacing - always add blank lines before lists
- Put each bullet point on its own line for better readability
- Use numbered lists when showing steps or sequential information
- Include encouraging remarks about learning progress when appropriate
- When creating lists, format them like this:

Contoh format yang benar:

• Item pertama
• Item kedua  
• Item ketiga

Bukan seperti ini: • Item1 • Item2 • Item3

EXAMPLE OF GOOD VS BAD RESPONSES:

❌ BAD (Raw data copying):
"Document 1 - Physics Laws (science): Newton's first law states that an object at rest will remain at rest..."

✅ GOOD (Understanding and summarizing):
"Berdasarkan materi fisika yang tersedia, hukum gerak Newton menjelaskan bahwa benda yang diam akan tetap diam kecuali ada gaya yang mempengaruhinya. Ini adalah konsep dasar dalam memahami gerakan benda..."

REMEMBER: Your job is to be a knowledgeable teacher who understands the material and explains it clearly, NOT a copy-paste machine!`

    // Create user prompt with context
    const userPrompt = docs.length > 0 
      ? `ORIGINAL USER QUESTION: "${question}"

RELEVANT KNOWLEDGE BASE CONTEXT:
${context}

TASK: Please understand the above knowledge base materials and provide a comprehensive, natural answer to the user's question. Do not copy raw text - instead, synthesize and explain the information in your own words that directly addresses what the user is asking about.`
      : `ORIGINAL USER QUESTION: "${question}"

STATUS: No specific context was found in the knowledge base for this question.

TASK: Please provide a helpful general response based on your knowledge and encourage the user about their learning journey. Be supportive and offer alternative ways to help.`

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
      // No knowledge base context - provide general educational response
      return `Halo! Saya GenEdu Agent, asisten pembelajaran AI yang siap membantu Anda! 

Meskipun pertanyaan Anda tidak ada di knowledge base khusus kami, saya tetap bisa membantu dengan:

• Menjawab pertanyaan akademik umum
• Menjelaskan konsep-konsep pembelajaran  
• Memberikan tips belajar
• Bantuan dengan tugas dan materi kuliah
• Diskusi topik pendidikan

Silakan tanyakan apa saja yang ingin Anda pelajari! 😊`
      
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
  private async* generateStreamingAnswer(question: string, docs: any[], includeMemory: boolean = true): AsyncGenerator<string, void, unknown> {
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

    // Get conversation memory context
    const memoryContext = includeMemory ? this.getConversationContext() : ''

    // Create comprehensive system prompt
    const systemPrompt = `You are GenEdu Agent, a friendly and intelligent AI learning assistant for the GenEdu educational platform.

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

${memoryContext ? `CONVERSATION HISTORY:
${memoryContext}

` : ''}CORE PERSONALITY:
- Warm, helpful, and encouraging learning companion
- Respond naturally to greetings (e.g., "Halo! Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?")
- Always maintain a positive, patient, and educational tone
- Adapt your communication style to match the user (formal/informal, Indonesian/English)
- Be conversational and supportive while being educational
- Reference previous conversations when relevant to provide continuity

KNOWLEDGE BASE CONTEXT:
${docs.length > 0 ? `✅ Found ${docs.length} relevant document(s) from the knowledge base` : '⚠️ No specific documents found in knowledge base'}

CRITICAL INSTRUCTION - UNDERSTANDING AND SUMMARIZING:
🚨 NEVER copy or paste raw data from the knowledge base documents
🚨 ALWAYS understand the content first, then provide a summary that directly answers the user's question
🚨 Process the information and present it in your own words, tailored to what the user is asking
🚨 **IMPORTANT**: If no knowledge base context is available, answer using your general knowledge as an educational assistant
🚨 **NEVER refuse to answer** - always provide helpful educational content regardless of knowledge base availability

RESPONSE INSTRUCTIONS:
- **PRIMARY GOAL**: Answer the user's question helpfully and naturally
- If knowledge base context is available: READ, UNDERSTAND, and SYNTHESIZE the information  
- If no knowledge base context: Use your general educational knowledge to provide helpful content
- For any question (academic, casual, greeting), provide a natural, helpful response
- Answer in the same language as the question (Indonesian/English)
- Be encouraging about learning and studying
- Use conversation history to provide personalized and contextual responses
- Reference previous topics when relevant to show understanding and continuity

CONTEXT HANDLING:
- **With context**: UNDERSTAND the knowledge base materials and provide clear explanations
- **Without context**: Provide general educational knowledge while being transparent about the source
- **Never refuse**: Always try to assist in some educational way, even for general questions
- Use conversation history to understand follow-up questions and provide continuity

FORMAT GUIDELINES:
- Keep responses clear and well-structured
- Use bullet points (•) with proper spacing - always add blank lines before lists
- Put each bullet point on its own line for better readability
- Use numbered lists when showing steps or sequential information
- Include encouraging remarks about learning progress when appropriate
- When creating lists, format them like this:

Contoh format yang benar:

• Item pertama
• Item kedua  
• Item ketiga

Bukan seperti ini: • Item1 • Item2 • Item3

EXAMPLE OF GOOD VS BAD RESPONSES:

❌ BAD (Raw data copying):
"Document 1 - Physics Laws (science): Newton's first law states that an object at rest will remain at rest..."

✅ GOOD (Understanding and summarizing):
"Berdasarkan materi fisika yang tersedia, hukum gerak Newton menjelaskan bahwa benda yang diam akan tetap diam kecuali ada gaya yang mempengaruhinya. Ini adalah konsep dasar dalam memahami gerakan benda..."

REMEMBER: Your job is to be a knowledgeable teacher who understands the material and explains it clearly, NOT a copy-paste machine!`

    // Create user prompt with context
    const userPrompt = docs.length > 0 
      ? `ORIGINAL USER QUESTION: "${question}"

RELEVANT KNOWLEDGE BASE CONTEXT:
${context}

TASK: Please understand the above knowledge base materials and provide a comprehensive, natural answer to the user's question. Do not copy raw text - instead, synthesize and explain the information in your own words that directly addresses what the user is asking about.`
      : `ORIGINAL USER QUESTION: "${question}"

STATUS: No specific context was found in the knowledge base for this question.

TASK: Please provide a helpful general response based on your knowledge and encourage the user about their learning journey. Be supportive and offer alternative ways to help.`

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
        // No knowledge base context - provide general educational response
        fallbackAnswer = `Halo! Saya GenEdu Agent, asisten pembelajaran AI yang siap membantu Anda! 

Meskipun pertanyaan Anda tidak ada di knowledge base khusus kami, saya tetap bisa membantu dengan:

• Menjawab pertanyaan akademik umum
• Menjelaskan konsep-konsep pembelajaran  
• Memberikan tips belajar
• Bantuan dengan tugas dan materi kuliah
• Diskusi topik pendidikan

Silakan tanyakan apa saja yang ingin Anda pelajari! 😊`
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
   * Add a conversation to memory
   */
  private addToMemory(question: string, answer: string, sources?: any[], confidence?: number) {
    const memory: ConversationMemory = {
      question,
      answer,
      timestamp: new Date(),
      sources,
      confidence
    }
    
    RAGService.globalConversationMemory.unshift(memory) // Add to beginning
    
    // Keep only the most recent conversations
    if (RAGService.globalConversationMemory.length > this.maxMemorySize) {
      RAGService.globalConversationMemory = RAGService.globalConversationMemory.slice(0, this.maxMemorySize)
    }
  }

  /**
   * Get conversation history for context
   */
  private getConversationContext(): string {
    if (RAGService.globalConversationMemory.length === 0) return ''
    
    const recentConversations = RAGService.globalConversationMemory.slice(0, 3) // Last 3 conversations
    return recentConversations.map((conv: ConversationMemory, index: number) => 
      `Previous Conversation ${index + 1}:
Q: ${conv.question}
A: ${conv.answer.substring(0, 200)}${conv.answer.length > 200 ? '...' : ''}
---`
    ).join('\n')
  }

  /**
   * Clear conversation memory
   */
  clearMemory() {
    RAGService.globalConversationMemory = []
  }

  /**
   * Get current conversation memory
   */
  getMemory(): ConversationMemory[] {
    return [...RAGService.globalConversationMemory]
  }
}

export default RAGService
