import mongoose from "mongoose";

interface IKnowledgeBase extends mongoose.Document {
    title: string;
    content: string;
    source: 'quiz' | 'notebook' | 'pdf' | 'manual';
    sourceId: string;
    userId: string;    metadata: {
        difficulty?: string;
        subject?: string;
        tags?: string[];
        score?: number;
        questionsCount?: number;
        createdAt: Date;
        lastUpdated: Date;
    };
    embeddings?: number[];
    isActive: boolean;
}

const KnowledgeBaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    source: {
        type: String,
        enum: ['quiz', 'notebook', 'pdf', 'manual'],
        required: true,
    },
    sourceId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },    metadata: {
        difficulty: String,
        subject: String,
        tags: [String],
        score: Number,
        questionsCount: Number,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    embeddings: [Number],
    isActive: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true
})

KnowledgeBaseSchema.index({ userId: 1, source: 1 });
KnowledgeBaseSchema.index({ userId: 1, 'metadata.subject': 1 });
KnowledgeBaseSchema.index({ userId: 1, 'metadata.createdAt': -1 });
KnowledgeBaseSchema.index({ sourceId: 1, userId: 1 });
KnowledgeBaseSchema.index({ 'metadata.tags': 1 });

export default mongoose.models.KnowledgeBase || mongoose.model<IKnowledgeBase>('KnowledgeBase', KnowledgeBaseSchema)