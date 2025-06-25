import { MongoClient, Db, Collection } from 'mongodb'

export interface KnowledgeVector {
  _id?: string
  text: string
  title: string
  category: string
  tags: string[]
  embedding: number[]
  metadata: {
    source: string
    createdAt: string
    updatedAt: string
  }
}

class VectorDatabase {
  private client: MongoClient | null = null
  private db: Db | null = null
  private collection: Collection<KnowledgeVector> | null = null

  constructor() {
    this.connect()
  }

  private async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db(process.env.MONGODB_DB || 'genedu')
      this.collection = this.db.collection<KnowledgeVector>('knowledgebases')
      
      // Create vector search index if it doesn't exist
      await this.createVectorIndex()
      
      console.log('Connected to MongoDB for vector storage')
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
    }
  }

  private async createVectorIndex() {
    try {
      if (!this.collection) return

      // Create vector search index for embeddings
      await this.collection.createIndex(
        { embedding: "2dsphere" },
        { 
          name: "vector_index",
          background: true 
        }
      )

      // Create text search index
      await this.collection.createIndex(
        { 
          title: "text", 
          text: "text", 
          category: "text",
          tags: "text"
        },
        { 
          name: "text_search_index",
          background: true 
        }
      )
    } catch (error) {
      console.error('Failed to create indexes:', error)
    }
  }

  async addVector(document: Omit<KnowledgeVector, '_id'>): Promise<string | null> {
    try {
      if (!this.collection) return null

      const result = await this.collection.insertOne(document)
      return result.insertedId.toString()
    } catch (error) {
      console.error('Failed to add vector:', error)
      return null
    }
  }

  async searchSimilar(
    queryEmbedding: number[], 
    limit: number = 5, 
    threshold: number = 0.7
  ): Promise<KnowledgeVector[]> {
    try {
      if (!this.collection) return []

      // Try MongoDB Atlas Vector Search first (requires Atlas with proper index)
      try {
        const pipeline = [
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryEmbedding,
              numCandidates: 100,
              limit: limit
            }
          },
          {
            $addFields: {
              score: { $meta: "vectorSearchScore" }
            }
          },
          {
            $match: {
              score: { $gte: threshold }
            }
          }
        ]

        const results = await this.collection.aggregate(pipeline).toArray()
        if (results.length > 0) {
          return results as KnowledgeVector[]
        }
      } catch (vectorError) {
        console.log('Vector search not available, using manual similarity calculation')
      }
      
      // Fallback to manual cosine similarity calculation
      const allDocs = await this.collection.find({}).toArray()
      
      const docsWithSimilarity = allDocs.map(doc => {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding)
        return {
          ...doc,
          score: similarity
        }
      })
      
      // Filter by threshold and sort by similarity
      const filteredDocs = docsWithSimilarity
        .filter(doc => doc.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
      
      return filteredDocs as KnowledgeVector[]
    } catch (error) {
      console.error('Similarity search failed, falling back to text search:', error)
      
      // Final fallback to text search
      if (!this.collection) return []
      return await this.collection
        .find({})
        .limit(limit)
        .toArray()
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  async textSearch(query: string, limit: number = 5): Promise<KnowledgeVector[]> {
    try {
      if (!this.collection) return []

      const results = await this.collection
        .find({
          $text: { $search: query }
        })
        .limit(limit)
        .toArray()

      return results
    } catch (error) {
      console.error('Text search failed:', error)
      return []
    }
  }

  async updateVector(id: string, updates: Partial<KnowledgeVector>): Promise<boolean> {
    try {
      if (!this.collection) return false

      const result = await this.collection.updateOne(
        { _id: id as any },
        { $set: { ...updates, 'metadata.updatedAt': new Date().toISOString() } }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Failed to update vector:', error)
      return false
    }
  }

  async deleteVector(id: string): Promise<boolean> {
    try {
      if (!this.collection) return false

      const result = await this.collection.deleteOne({ _id: id as any })
      return result.deletedCount > 0
    } catch (error) {
      console.error('Failed to delete vector:', error)
      return false
    }
  }

  async close() {
    if (this.client) {
      await this.client.close()
    }
  }
}

export default VectorDatabase
