import KnowledgeBase from '@/lib/models/KnowledgeBase';
import Quiz from '@/lib/models/Quiz';
import connectToDatabase from '@/lib/database/mongodb';

export interface KnowledgeEntry {
  _id: string;
  title: string;
  content: string;
  source: 'quiz' | 'notebook' | 'pdf' | 'manual';
  sourceId: string;
  userId: string;
  metadata: {
    difficulty?: string;
    subject?: string;
    tags?: string[];
    score?: number;
    questionsCount?: number;
    createdAt: Date;
    lastUpdated: Date;
  };
  isActive: boolean;
}

export class KnowledgeBaseManager {
  
  static async addQuizToKnowledgeBase(quizId: string, userId: string, submissionData?: {
    score: number;
    questionsCount: number;
    answers: any[];
  }) {
    try {
      await connectToDatabase();
      
      const quiz = await Quiz.findOne({ quizId });
      if (!quiz) {
        console.log('Quiz not found:', quizId);
        return null;
      }

      // Check if already exists untuk quiz ini
      const existing = await KnowledgeBase.findOne({
        sourceId: quizId,
        source: 'quiz',
        userId: userId
      });

      const quizContent = this.formatQuizContent(quiz, submissionData);

      if (existing) {
        // Update existing entry dengan data submission terbaru
        existing.content = quizContent;
        existing.metadata.score = submissionData?.score;
        existing.metadata.questionsCount = submissionData?.questionsCount;
        existing.metadata.lastUpdated = new Date();
        await existing.save();
        console.log('Updated existing quiz in knowledge base:', quizId);
        return existing;
      }

      // Create new knowledge base entry
      const knowledgeEntry = new KnowledgeBase({
        title: quiz.title || 'Untitled Quiz',
        content: quizContent,
        source: 'quiz',
        sourceId: quizId,
        userId: userId,
        metadata: {
          difficulty: quiz.metadata?.difficulty || 'medium',
          subject: quiz.metadata?.subject || 'general',
          tags: quiz.metadata?.tags || [],
          score: submissionData?.score,
          questionsCount: submissionData?.questionsCount,
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
        isActive: true,
      });

      await knowledgeEntry.save();
      console.log('Added new quiz to knowledge base:', quizId);
      return knowledgeEntry;
      
    } catch (error) {
      console.error('Error adding quiz to knowledge base:', error);
      return null;
    }
  }

  static formatQuizContent(quiz: any, submissionData?: {
    score: number;
    questionsCount: number;
    answers: any[];
  }): string {
    let content = `Quiz: ${quiz.title || 'Untitled Quiz'}\n`;
    
    if (quiz.description) {
      content += `Description: ${quiz.description}\n`;
    }
    
    content += `Difficulty: ${quiz.metadata?.difficulty || 'medium'}\n`;
    content += `Subject: ${quiz.metadata?.subject || 'general'}\n`;
    
    if (submissionData) {
      content += `Your Score: ${submissionData.score}%\n`;
      content += `Questions Answered: ${submissionData.questionsCount}\n`;
    }
    
    content += `Total Questions: ${quiz.questions?.length || 0}\n\n`;
    
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((question: any, index: number) => {
        content += `Question ${index + 1}: ${question.question || question.text || 'No question text'}\n`;
        
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach((option: any, optIndex: number) => {
            const isCorrect = typeof option === 'object' 
              ? option.isCorrect 
              : optIndex === question.correctAnswer;
            const optionText = typeof option === 'object' ? option.text : option;
            const marker = isCorrect ? '✓' : '○';
            content += `${marker} ${optionText}\n`;
          });
        }
        
        if (question.explanation) {
          content += `Explanation: ${question.explanation}\n`;
        }
        
        // Add user's answer if available
        if (submissionData?.answers) {
          const userAnswer = submissionData.answers.find(a => a.questionId === question._id);
          if (userAnswer) {
            content += `Your Answer: ${userAnswer.userAnswer} ${userAnswer.isCorrect ? '✓' : '✗'}\n`;
          }
        }
        
        content += '\n';
      });
    }
    
    return content;
  }

  static async getRecentQuizzes(userId: string, days: number = 7, limit: number = 10): Promise<KnowledgeEntry[]> {
    try {
      await connectToDatabase();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentQuizzes = await KnowledgeBase.find({
        userId,
        source: 'quiz',
        isActive: true,
        'metadata.createdAt': { $gte: cutoffDate }
      })
      .sort({ 'metadata.createdAt': -1 })
      .limit(limit)
      .lean();

      return recentQuizzes as unknown as KnowledgeEntry[];
      
    } catch (error) {
      console.error('Error getting recent quizzes:', error);
      return [];
    }
  }

  static async getKnowledgeBaseForUser(userId: string, filters?: {
    source?: string;
    subject?: string;
    tags?: string[];
    limit?: number;
    search?: string;
    days?: number;
  }): Promise<KnowledgeEntry[]> {
    try {
      await connectToDatabase();
      
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

      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { content: { $regex: filters.search, $options: 'i' } },
          { 'metadata.subject': { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters?.days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.days);
        query['metadata.createdAt'] = { $gte: cutoffDate };
      }
      
      const knowledgeBase = await KnowledgeBase.find(query)
        .sort({ 'metadata.lastUpdated': -1 })
        .limit(filters?.limit || 50)
        .lean();
      
      return knowledgeBase as unknown as KnowledgeEntry[];
      
    } catch (error) {
      console.error('Error getting knowledge base:', error);
      return [];
    }
  }

  static async getKnowledgeStats(userId: string): Promise<{
    totalEntries: number;
    bySource: Record<string, number>;
    bySubject: Record<string, number>;
    recentCount: number;
    averageScore: number;
  }> {
    try {
      await connectToDatabase();
      
      const pipeline = [
        { $match: { userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            sources: { $push: '$source' },
            subjects: { $push: '$metadata.subject' },
            scores: { $push: '$metadata.score' }
          }
        }
      ];

      const result = await KnowledgeBase.aggregate(pipeline);
      
      if (!result || result.length === 0) {
        return {
          totalEntries: 0,
          bySource: {},
          bySubject: {},
          recentCount: 0,
          averageScore: 0
        };
      }

      const data = result[0];
      
      // Count by source
      const bySource: Record<string, number> = {};
      data.sources.forEach((source: string) => {
        bySource[source] = (bySource[source] || 0) + 1;
      });

      // Count by subject
      const bySubject: Record<string, number> = {};
      data.subjects.forEach((subject: string) => {
        if (subject) {
          bySubject[subject] = (bySubject[subject] || 0) + 1;
        }
      });

      // Calculate average score
      const validScores = data.scores.filter((score: number) => score != null && !isNaN(score));
      const averageScore = validScores.length > 0 
        ? validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length
        : 0;

      // Count recent entries (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentCount = await KnowledgeBase.countDocuments({
        userId,
        isActive: true,
        'metadata.createdAt': { $gte: weekAgo }
      });

      return {
        totalEntries: data.totalEntries,
        bySource,
        bySubject,
        recentCount,
        averageScore: Math.round(averageScore)
      };
      
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return {
        totalEntries: 0,
        bySource: {},
        bySubject: {},
        recentCount: 0,
        averageScore: 0
      };
    }
  }

  static async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      await connectToDatabase();

      const result = await KnowledgeBase.findOneAndUpdate(
        { _id: entryId, userId },
        { isActive: false },
        { new: true }
      );

      return !!result;
      
    } catch (error) {
      console.error('Error deleting knowledge base entry:', error);
      return false;
    }
  }
}