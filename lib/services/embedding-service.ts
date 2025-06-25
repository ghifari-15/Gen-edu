class EmbeddingService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.DEEPINFRA_API_KEY || ''
    this.baseURL = 'https://api.deepinfra.com/v1/openai'
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "BAAI/bge-base-en-v1.5",
          input: text,
          encoding_format: "float"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      return null
    }
  }

  async generateMultipleEmbeddings(texts: string[]): Promise<number[][] | null> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "BAAI/bge-base-en-v1.5",
          input: texts,
          encoding_format: "float"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error('Failed to generate multiple embeddings:', error)
      return null
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  // Find most similar vectors using cosine similarity
  findMostSimilar(
    queryVector: number[], 
    vectors: { id: string; vector: number[]; metadata?: any }[], 
    topK: number = 5,
    threshold: number = 0.7
  ): { id: string; similarity: number; metadata?: any }[] {
    const similarities = vectors.map(item => ({
      id: item.id,
      similarity: this.cosineSimilarity(queryVector, item.vector),
      metadata: item.metadata
    }))

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }
}

export default EmbeddingService
