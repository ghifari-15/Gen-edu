import KnowledgeBase from "../models/KnowledgeBase";
import Quiz from "../models/Quiz";
import dbConnect from "../database/mongodb";


export class KnowledgeBaseManager {
    
    static async addQuizToKnowledgeBase(quizId: string, userId: string) {
        try {
            await dbConnect();

            const quiz = await Quiz.findOne({ quizId });
            if (!quiz) {
                throw new Error('Quiz not found')
            }

            const existingEntry = await KnowledgeBase.findOne({
                sourceId: quizId,
                source: 'quiz',
                userId: userId,
            });

            if (existingEntry) {
                existingEntry.content = this.formatQuizContent(quiz);
                existingEntry.metadata.updatedAt = new Date();
                await existingEntry.save();
                return existingEntry;
            }
        
        
        
        } catch (error) {

        }
    }

    static formatQuizContent(quiz: any): string {
        let content = `Quiz: ${quiz.title}\n`;
        content += `Description: ${quiz.description}\n`;

        quiz.questions.forEach((question: any, index: number) => {
            content += `Question ${index + 1}: $qu`
        })
    }
}