import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IActivity extends Document {
  _id: string;
  activityId: string;
  userId: string;
  type: 'notebook_created' | 'notebook_updated' | 'notebook_deleted' | 'quiz_completed' | 'login' | 'profile_updated' | 'learning_session';
  title: string;
  description?: string;
  metadata: {
    notebookId?: string;
    quizId?: string;
    sessionDuration?: number; // in minutes
    wordsWritten?: number;
    cellsAdded?: number;
    score?: number;
    difficulty?: string;
    subject?: string;
    additionalData?: any;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityModel extends Model<IActivity> {
  findByUserId(userId: string, limit?: number): Promise<IActivity[]>;
  trackActivity(userId: string, type: IActivity['type'], data: {
    title: string;
    description?: string;
    metadata?: IActivity['metadata'];
  }): Promise<IActivity>;
  getTotalLearningHours(userId: string): Promise<number>;
  getActivityStats(userId: string): Promise<{
    totalActivities: number;
    notebooksCreated: number;
    totalLearningHours: number;
    streakDays: number;
    activeDays: number;
  }>;
}

const ActivitySchema = new Schema<IActivity>(
  {
    activityId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'notebook_created',
        'notebook_updated', 
        'notebook_deleted',
        'quiz_completed',
        'login',
        'profile_updated',
        'learning_session'
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      notebookId: {
        type: String,
      },
      quizId: {
        type: String,
      },
      sessionDuration: {
        type: Number,
        min: 0,
      },
      wordsWritten: {
        type: Number,
        min: 0,
      },
      cellsAdded: {
        type: Number,
        min: 0,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
      subject: {
        type: String,
      },
      additionalData: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });
ActivitySchema.index({ timestamp: -1 });

// Generate unique activityId
ActivitySchema.pre('save', function(next) {
  if (!this.activityId) {
    this.activityId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  next();
});

// Static method to find activities by userId
ActivitySchema.statics.findByUserId = function(userId: string, limit: number = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
};

// Static method to track activity
ActivitySchema.statics.trackActivity = async function(
  userId: string, 
  type: IActivity['type'], 
  data: {
    title: string;
    description?: string;
    metadata?: IActivity['metadata'];
  }
): Promise<IActivity> {
  const activity = new this({
    userId,
    type,
    title: data.title,
    description: data.description,
    metadata: data.metadata || {},
  });
  
  return await activity.save();
};

// Static method to get total learning hours
ActivitySchema.statics.getTotalLearningHours = async function(userId: string): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        userId,
        type: { $in: ['learning_session', 'notebook_updated'] }
      }
    },
    {
      $group: {
        _id: null,
        totalMinutes: {
          $sum: '$metadata.sessionDuration'
        }
      }
    }
  ]);
  
  const totalMinutes = result[0]?.totalMinutes || 0;
  return Math.round((totalMinutes / 60) * 10) / 10; // Convert to hours, round to 1 decimal
};

// Static method to get activity statistics
ActivitySchema.statics.getActivityStats = async function(userId: string) {
  const [totalActivities, notebooksCreated, totalLearningHours, activityDays] = await Promise.all([
    // Total activities count
    this.countDocuments({ userId }),
    
    // Notebooks created count
    this.countDocuments({ userId, type: 'notebook_created' }),
    
    // Total learning hours
    (this as unknown as IActivityModel).getTotalLearningHours(userId),
    
    // Get distinct active days
    this.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        }
      },
      {
        $count: 'activeDays'
      }
    ])
  ]);

  // Calculate streak days (consecutive days with activity)
  const recentActivities = await this.find({ userId })
    .sort({ timestamp: -1 })
    .select('timestamp')
    .limit(100);

  let streakDays = 0;
  if (recentActivities.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activityDates = recentActivities.map((activity: { timestamp: Date }) => {
      const date = new Date(activity.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = ([...new Set(activityDates)] as number[]).sort((a, b) => b - a);
    
    let currentDate = today.getTime();
    for (const activityDate of uniqueDates) {
      if (activityDate === currentDate || activityDate === currentDate - 86400000) {
        streakDays++;
        currentDate = activityDate - 86400000;
      } else {
        break;
      }
    }
  }

  return {
    totalActivities,
    notebooksCreated,
    totalLearningHours,
    streakDays,
    activeDays: activityDays[0]?.activeDays || 0,
  };
};

const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
