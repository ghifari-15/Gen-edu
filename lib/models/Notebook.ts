import mongoose, { Document, Schema } from 'mongoose';

export interface ICell {
  id: string;
  type: 'markdown' | 'code' | 'text';
  content: string;
  metadata?: {
    language?: string;
    tags?: string[];
    collapsed?: boolean;
  };
  outputs?: any[];
  executionCount?: number;
}

export interface INotebook extends Document {
  _id: string;
  notebookId: string;
  title: string;
  description?: string;
  userId: string;
  cells: ICell[];
  metadata: {
    language: string;
    kernelspec?: {
      display_name: string;
      language: string;
      name: string;
    };
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number; // in minutes
    subjects: string[];
  };
  sharing: {
    isPublic: boolean;
    sharedWith: string[]; // user IDs
    permissions: {
      canView: boolean;
      canEdit: boolean;
      canComment: boolean;
    };
  };
  version: number;
  lastSaved: Date;
  isTemplate: boolean;
  templateCategory?: string;
  stats: {
    views: number;
    likes: number;
    forks: number;
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CellSchema = new Schema<ICell>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['markdown', 'code', 'text'],
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  metadata: {
    language: String,
    tags: [String],
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  outputs: [{
    type: Schema.Types.Mixed,
  }],
  executionCount: {
    type: Number,
    default: 0,
  },
});

const NotebookSchema = new Schema<INotebook>(
  {
    notebookId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    cells: [CellSchema],
    metadata: {
      language: {
        type: String,
        default: 'javascript',
      },
      kernelspec: {
        display_name: String,
        language: String,
        name: String,
      },
      tags: [String],
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
      },
      estimatedTime: {
        type: Number,
        default: 30,
      },
      subjects: [String],
    },
    sharing: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      sharedWith: [String],
      permissions: {
        canView: {
          type: Boolean,
          default: true,
        },
        canEdit: {
          type: Boolean,
          default: false,
        },
        canComment: {
          type: Boolean,
          default: true,
        },
      },
    },
    version: {
      type: Number,
      default: 1,
    },
    lastSaved: {
      type: Date,
      default: Date.now,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateCategory: {
      type: String,
    },
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      forks: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotebookSchema.index({ userId: 1, createdAt: -1 });
NotebookSchema.index({ notebookId: 1 });
NotebookSchema.index({ 'metadata.tags': 1 });
NotebookSchema.index({ 'metadata.subjects': 1 });
NotebookSchema.index({ 'sharing.isPublic': 1 });
NotebookSchema.index({ title: 'text', description: 'text' });

// Virtual untuk mendapatkan ID sebagai string
NotebookSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialised
NotebookSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.Notebook || mongoose.model<INotebook>('Notebook', NotebookSchema);