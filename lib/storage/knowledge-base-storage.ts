// Global storage untuk knowledge base (simulasi database)
// Dalam implementasi nyata, ini akan menggunakan database seperti MongoDB

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  source: 'manual' | 'upload'
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

class KnowledgeBaseStorage {
  private static instance: KnowledgeBaseStorage
  private entries: KnowledgeEntry[] = [
    {
      id: '1',
      title: 'Introduction to Calculus',
      content: 'Calculus is a branch of mathematics that deals with continuous change. It includes differential and integral calculus, which are fundamental to understanding rates of change and areas under curves.',
      source: 'manual',
      category: 'Mathematics',
      tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Physics Laws',
      content: 'Newton\'s laws of motion are three basic laws of classical mechanics that describe the relationship between forces and motion. The first law states that an object at rest stays at rest unless acted upon by an external force.',
      source: 'upload',
      category: 'Physics',
      tags: ['physics', 'newton', 'laws', 'motion'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Programming Fundamentals',
      content: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. It involves problem-solving, logical thinking, and understanding of algorithms.',
      source: 'manual',
      category: 'Computer Science',
      tags: ['programming', 'algorithms', 'logic', 'computer science'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  public static getInstance(): KnowledgeBaseStorage {
    if (!KnowledgeBaseStorage.instance) {
      KnowledgeBaseStorage.instance = new KnowledgeBaseStorage()
    }
    return KnowledgeBaseStorage.instance
  }

  public getAll(): KnowledgeEntry[] {
    return [...this.entries] // Return copy to prevent direct mutation
  }

  public getById(id: string): KnowledgeEntry | undefined {
    return this.entries.find(entry => entry.id === id)
  }

  public add(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeEntry {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.entries.push(newEntry)
    return newEntry
  }

  public addMultiple(entries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[]): KnowledgeEntry[] {
    const newEntries = entries.map(entry => this.add(entry))
    return newEntries
  }

  public update(id: string, updates: Partial<Omit<KnowledgeEntry, 'id' | 'createdAt'>>): KnowledgeEntry | null {
    const index = this.entries.findIndex(entry => entry.id === id)
    if (index === -1) return null

    this.entries[index] = {
      ...this.entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.entries[index]
  }

  public delete(id: string): boolean {
    const index = this.entries.findIndex(entry => entry.id === id)
    if (index === -1) return false

    this.entries.splice(index, 1)
    return true
  }

  public search(query: string): KnowledgeEntry[] {
    const lowercaseQuery = query.toLowerCase()
    return this.entries.filter(entry =>
      entry.title.toLowerCase().includes(lowercaseQuery) ||
      entry.content.toLowerCase().includes(lowercaseQuery) ||
      entry.category.toLowerCase().includes(lowercaseQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  public getByCategory(category: string): KnowledgeEntry[] {
    return this.entries.filter(entry => entry.category === category)
  }

  public getBySource(source: 'manual' | 'upload'): KnowledgeEntry[] {
    return this.entries.filter(entry => entry.source === source)
  }

  public getStats() {
    return {
      total: this.entries.length,
      manual: this.entries.filter(e => e.source === 'manual').length,
      uploaded: this.entries.filter(e => e.source === 'upload').length,
      categories: [...new Set(this.entries.map(e => e.category))].length
    }
  }
}

export default KnowledgeBaseStorage
