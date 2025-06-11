import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface IQuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code';
  question: string;
  options?: IQuizOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  codeTemplate?: string;
  testCases?: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface IQuizAttempt {
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: {
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
    pointsEarned?: number;
    timeSpent?: number; // in seconds
  }[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeLimit?: number; // in minutes
  isCompleted: boolean;
}

export interface IQuiz extends Document {
  _id: string;
  quizId: string;
  title: string;
  description?: string;
  userId: string; // creator
  questions: IQuizQuestion[];
  settings: {
    timeLimit?: number; // in minutes
    attempts: number; // number of allowed attempts
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    passingScore: number; // percentage
    isPublic: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
  };
  metadata: {
    subject: string;
    grade?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number; // in minutes
    tags: string[];
    category: string;
  };
  attempts: IQuizAttempt[];
  stats: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    views: number;
  };
  isTemplate: boolean;
  templateCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizOptionSchema = new Schema<IQuizOption>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'code'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [QuizOptionSchema],
  correctAnswer: {
    type: String,
  },
  explanation: {
    type: String,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: [String],
  codeTemplate: {
    type: String,
  },
  testCases: [{
    input: String,
    expectedOutput: String,
  }],
});

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  userId: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
  },
  answers: [{
    questionId: String,
    answer: Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    timeSpent: Number,
  }],
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  timeLimit: {
    type: Number,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const QuizSchema = new Schema<IQuiz>(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    questions: [QuizQuestionSchema],
    settings: {
      timeLimit: {
        type: Number,
      },
      attempts: {
        type: Number,
        default: 3,
      },
      randomizeQuestions: {
        type: Boolean,
        default: false,
      },
      randomizeOptions: {
        type: Boolean,
        default: false,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
      showExplanations: {
        type: Boolean,
        default: true,
      },
      passingScore: {
        type: Number,
        default: 70,
      },
      isPublic: {
        type: Boolean,
        default: false,
      },
      availableFrom: {
        type: Date,
      },
      availableUntil: {
        type: Date,
      },
    },
    metadata: {
      subject: {
        type: String,
        required: true,
      },
      grade: {
        type: String,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
      },
      estimatedTime: {
        type: Number,
        required: true,
      },
      tags: [String],
      category: {
        type: String,
        required: true,
      },
    },
    attempts: [QuizAttemptSchema],
    stats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateCategory: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ 'metadata.subject': 1 });
QuizSchema.index({ 'metadata.tags': 1 });
QuizSchema.index({ 'settings.isPublic': 1 });
QuizSchema.index({ title: 'text', description: 'text' });

// Virtual untuk mendapatkan ID sebagai string
QuizSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialised
QuizSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);