import { KnowledgeBaseManager, KnowledgeEntry } from './knowledge-base';

export interface LLMContext {
  content: string;
  sources: Array<{
    id: string;
    title: string;
    source: string;
    relevanceScore: number;
    score?: number;
  }>;
  tokenCount: number;
  contextUsed: boolean;
}

export interface RelevantKnowledge extends KnowledgeEntry {
  relevanceScore: number;
}

export class LLMContextProvider {
  
  /**
   * Get context for user with recent quiz focus
   */
  static async getContextForUser(
    userId: string, 
    query?: string, 
    options: {
      maxTokens?: number;
      focusOnRecent?: boolean;
      recentDays?: number;
      includeSource?: string[];
      maxSources?: number;
    } = {}
  ): Promise<string> {
    try {      const {
        maxTokens = 4000,
        focusOnRecent = true,
        recentDays = 7,
        includeSource = [],
        maxSources = 10
      } = options;

      let knowledgeEntries: KnowledgeEntry[] = [];

      if (focusOnRecent) {
        try {
          // Prioritize recent quizzes
          const recentQuizzes = await KnowledgeBaseManager.getRecentQuizzes(userId, recentDays);
          knowledgeEntries = recentQuizzes || [];
        } catch (error) {
          console.error('Error fetching recent quizzes:', error);
          knowledgeEntries = [];
        }
        
        // If not enough recent content, add older content
        if (knowledgeEntries.length < 3) {
          try {
            const olderContent = await KnowledgeBaseManager.getKnowledgeBaseForUser(userId, {
              limit: maxSources - knowledgeEntries.length,
              source: includeSource.length > 0 ? includeSource[0] : undefined
            });
            knowledgeEntries = [...knowledgeEntries, ...(olderContent || [])];
          } catch (error) {
            console.error('Error fetching older content:', error);
            // Continue with just recent content
          }
        }
      } else {
        // Get all knowledge base
        try {
          const filters: any = { limit: maxSources };
          if (includeSource.length > 0) {
            filters.source = includeSource[0];
          }
          knowledgeEntries = await KnowledgeBaseManager.getKnowledgeBaseForUser(userId, filters) || [];
        } catch (error) {
          console.error('Error fetching knowledge base:', error);
          knowledgeEntries = [];
        }
      }

      if (!knowledgeEntries || knowledgeEntries.length === 0) {
        return '';
      }

      // Sort by relevance if query provided
      let relevantKnowledge: RelevantKnowledge[] = knowledgeEntries.map(entry => ({
        ...entry,
        relevanceScore: 0
      }));
      
      if (query) {
        relevantKnowledge = this.filterByRelevance(knowledgeEntries, query);
      } else {
        // If no query, prioritize recent and high-scoring quizzes
        relevantKnowledge = this.prioritizeContent(knowledgeEntries);
      }

      // Build context string
      const context = this.buildContextString(relevantKnowledge, maxTokens);
      
      return context;
      
    } catch (error) {
      console.error('Error getting LLM context:', error);
      return '';
    }
  }

  /**
   * Get context specifically for recent quizzes
   */
  static async getRecentQuizContext(userId: string, days: number = 7): Promise<string> {
    return this.getContextForUser(userId, undefined, {
      focusOnRecent: true,
      recentDays: days,
      includeSource: ['quiz'],
      maxSources: 5,
      maxTokens: 3000
    });
  }

  /**
   * Get context for specific subject
   */
  static async getSubjectContext(userId: string, subject: string, query?: string): Promise<string> {
    try {
      const knowledgeEntries = await KnowledgeBaseManager.getKnowledgeBaseForUser(userId, {
        subject,
        limit: 8
      });

      if (!knowledgeEntries || knowledgeEntries.length === 0) {
        return '';
      }

      let relevantKnowledge: RelevantKnowledge[];
      
      if (query) {
        relevantKnowledge = this.filterByRelevance(knowledgeEntries, query);
      } else {
        relevantKnowledge = this.prioritizeContent(knowledgeEntries);
      }

      return this.buildContextString(relevantKnowledge, 3000);
      
    } catch (error) {
      console.error('Error getting subject context:', error);
      return '';
    }
  }

  /**
   * Filter knowledge by relevance to query
   */
  private static filterByRelevance(knowledgeBase: KnowledgeEntry[], query: string): RelevantKnowledge[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    return knowledgeBase
      .map(item => ({
        ...item,
        relevanceScore: this.calculateRelevanceScore(item, queryLower, queryWords)
      }))
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Prioritize content when no specific query
   */
  private static prioritizeContent(knowledgeBase: KnowledgeEntry[]): RelevantKnowledge[] {
    return knowledgeBase
      .map(item => ({
        ...item,
        relevanceScore: this.calculatePriorityScore(item)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Calculate relevance score based on query
   */
  private static calculateRelevanceScore(item: KnowledgeEntry, query: string, queryWords: string[]): number {
    let score = 0;
    const title = item.title.toLowerCase();
    const content = item.content.toLowerCase();
    
    // Exact phrase match in title (highest priority)
    if (title.includes(query)) {
      score += 20;
    }
    
    // Exact phrase match in content
    if (content.includes(query)) {
      score += 15;
    }
    
    // Individual word matches in title
    queryWords.forEach(word => {
      if (title.includes(word)) {
        score += 8;
      }
    });
    
    // Individual word matches in content
    queryWords.forEach(word => {
      const contentMatches = (content.match(new RegExp(word, 'g')) || []).length;
      score += contentMatches * 2;
    });
    
    // Tag relevance
    if (item.metadata?.tags) {
      const tagMatches = item.metadata.tags.filter((tag: string) => 
        queryWords.some(word => tag.toLowerCase().includes(word))
      ).length;
      score += tagMatches * 10;
    }
    
    // Subject relevance
    if (item.metadata?.subject) {
      const subjectLower = item.metadata.subject.toLowerCase();
      if (queryWords.some(word => subjectLower.includes(word))) {
        score += 12;
      }
    }
    
    // Recent content bonus
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(item.metadata.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate <= 7) {
      score += 8;
    }
    
    // Quiz score bonus (higher scoring quizzes are more relevant)
    if (item.source === 'quiz' && item.metadata.score) {
      score += Math.round(item.metadata.score / 10);
    }
    
    return score;
  }

  /**
   * Calculate priority score when no query
   */
  private static calculatePriorityScore(item: KnowledgeEntry): number {
    let score = 0;
    
    // Recent content gets higher priority
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(item.metadata.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate <= 1) score += 20;
    else if (daysSinceUpdate <= 3) score += 15;
    else if (daysSinceUpdate <= 7) score += 10;
    else if (daysSinceUpdate <= 14) score += 5;
    
    // Quiz scores matter
    if (item.source === 'quiz' && item.metadata.score) {
      score += Math.round(item.metadata.score / 5);
    }
    
    // Source priority (quiz > notebook > manual > pdf)
    switch (item.source) {
      case 'quiz': score += 15; break;
      case 'notebook': score += 10; break;
      case 'manual': score += 5; break;
      case 'pdf': score += 3; break;
    }
    
    return score;
  }

  /**
   * Build context string from relevant knowledge
   */
  private static buildContextString(knowledgeBase: RelevantKnowledge[], maxTokens: number): string {
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return '';
    }

    let context = 'Based on your recent learning materials:\n\n';
    let currentLength = this.estimateTokenCount(context);
    
    for (const item of knowledgeBase) {
      const itemHeader = `## ${item.source.toUpperCase()}: ${item.title}\n`;
      const itemMeta = item.metadata.score 
        ? `Score: ${item.metadata.score}% | Subject: ${item.metadata.subject || 'General'}\n`
        : `Subject: ${item.metadata.subject || 'General'}\n`;
      const itemContent = `${item.content}\n\n---\n\n`;
      
      const fullItem = itemHeader + itemMeta + itemContent;
      const itemTokens = this.estimateTokenCount(fullItem);
      
      if (currentLength + itemTokens > maxTokens) {
        // Try to fit a summary instead
        const summary = this.createSummary(item);
        const summaryTokens = this.estimateTokenCount(summary);
        
        if (currentLength + summaryTokens <= maxTokens) {
          context += summary;
          currentLength += summaryTokens;
        }
        break;
      }
      
      context += fullItem;
      currentLength += itemTokens;
    }
    
    return context;
  }

  /**
   * Create summary of knowledge entry
   */
  private static createSummary(item: KnowledgeEntry): string {
    const lines = item.content.split('\n').filter(line => line.trim());
    const summary = lines.slice(0, 3).join('\n'); // First 3 lines
    
    return `## ${item.source.toUpperCase()}: ${item.title}\n` +
           `Subject: ${item.metadata.subject || 'General'}${item.metadata.score ? ` | Score: ${item.metadata.score}%` : ''}\n` +
           `${summary}...\n\n---\n\n`;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private static estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get context summary for display
   */
  static async getContextSummary(userId: string): Promise<{
    totalEntries: number;
    bySource: Record<string, number>;
    bySubject: Record<string, number>;
    recentEntries: KnowledgeEntry[];
    averageScore: number;
  }> {
    try {
      const stats = await KnowledgeBaseManager.getKnowledgeStats(userId);
      const recentQuizzes = await KnowledgeBaseManager.getRecentQuizzes(userId, 7, 5);
      
      return {
        totalEntries: stats.totalEntries,
        bySource: stats.bySource,
        bySubject: stats.bySubject,
        recentEntries: recentQuizzes,
        averageScore: stats.averageScore
      };
      
    } catch (error) {
      console.error('Error getting context summary:', error);
      return {
        totalEntries: 0,
        bySource: {},
        bySubject: {},
        recentEntries: [],
        averageScore: 0
      };
    }
  }
}
