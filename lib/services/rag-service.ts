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
        
        return {
          answer: "I don't have any relevant information to answer your question. Please try rephrasing or ask about topics in our knowledge base.",
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

  private async generateAnswer(question: string, docs: any[]): Promise<string> {
    if (docs.length === 0) {
      return "I don't have sufficient information to answer your question."
    }

    // Prepare context from retrieved documents
    const context = docs.map((doc, index) => 
      `Document ${index + 1} - ${doc.title} (${doc.category}):\n${doc.text}`
    ).join('\n\n---\n\n')

    // Create prompt for LLM
    const prompt = `You are an AI assistant for GenEdu educational platform. Answer the user's question based on the provided context from the knowledge base.

Context from knowledge base:
${context}

User Question: ${question}

Instructions:
- Answer in the same language as the question (Indonesian or English)
- Use only information from the provided context
- Be concise but informative
- If the context doesn't contain enough information, say so clearly
- Format your answer in a clear, educational manner

Answer:`

    try {
      // Use DeepInfra API to generate answer
      const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPINFRA_TOKEN}`
        },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful educational assistant. Answer questions based only on the provided context.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
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
    const topDoc = docs[0]
    return `Based on the available information about "${topDoc.title}":

${topDoc.text.substring(0, 400)}${topDoc.text.length > 400 ? '...' : ''}

This information comes from our ${topDoc.category} knowledge base. Would you like me to provide more details about any specific aspect?`
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
}

export default RAGService
