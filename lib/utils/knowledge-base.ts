import KnowledgeBase from '@/lib/models/KnowledgeBase';
import Quiz from '@/lib/models/Quiz';
import dbConnect from '@/lib/database/mongodb';

export class KnowledgeBaseManager {
  
  static async addQuizToKnowledgeBase(quizId: string, userId: string) {
    try {
      await dbConnect();
      
      const quiz = await Quiz.findOne({ quizId });
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Check if already exists
      const existing = await KnowledgeBase.findOne({
        sourceId: quizId,
        source: 'quiz',
        userId: userId
      });

      if (existing) {
        // Update existing entry
        existing.content = this.formatQuizContent(quiz);
        existing.metadata.lastUpdated = new Date();
        await existing.save();
        return existing;
      }

      // Create new knowledge base entry
      const knowledgeEntry = new KnowledgeBase({
        title: quiz.title,
        content: this.formatQuizContent(quiz),
        source: 'quiz',
        sourceId: quizId,
        userId: userId,
        metadata: {
          difficulty: quiz.metadata.difficulty,
          subject: quiz.metadata.subject,
          tags: quiz.metadata.tags || [],
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
        isActive: true,
      });

      await knowledgeEntry.save();
      return knowledgeEntry;
      
    } catch (error) {
      console.error('Error adding quiz to knowledge base:', error);
      throw error;
    }
  }

  static formatQuizContent(quiz: any): string {
    let content = `Quiz: ${quiz.title}\n`;
    content += `Description: ${quiz.description}\n`;
    content += `Difficulty: ${quiz.metadata.difficulty}\n\n`;
    
    quiz.questions.forEach((question: any, index: number) => {
      content += `Question ${index + 1}: ${question.question}\n`;
      
      if (question.options) {
        question.options.forEach((option: any, optIndex: number) => {
          const marker = option.isCorrect ? '✓' : '○';
          content += `${marker} ${option.text}\n`;
        });
      }
      
      if (question.explanation) {
        content += `Explanation: ${question.explanation}\n`;
      }
      content += '\n';
    });
    
    return content;
  }

  static async getKnowledgeBaseForUser(userId: string, filters?: {
    source?: string;
    subject?: string;
    tags?: string[];
  }) {
    try {
      await dbConnect();
      
      const query: any = { userId, isActive: true };
      
      if (filters?.source) {
        query.source = filters.source;
      }
      
      if (filters?.subject) {
        query['metadata.subject'] = filters.subject;
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        query['metadata.tags'] = { $in: filters.tags };
      }
      
      const knowledgeBase = await KnowledgeBase.find(query)
        .sort({ 'metadata.lastUpdated': -1 })
        .limit(50);
      
      return knowledgeBase;
      
    } catch (error) {
      console.error('Error getting knowledge base:', error);
      throw error;
    }
  }
}