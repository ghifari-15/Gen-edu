import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  userId: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';  avatar?: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  profile: {
    bio?: string;
    institution?: string;
    grade?: string;
    subjects?: string[];
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
    trialUsed: boolean;
  };
  statistics: {
    notebooksCreated: number;
    quizzesCompleted: number;
    quizzesCreated: number;
    totalStudyTime: number;
    streakDays: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Static methods interface
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUserId(userId: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>(
  {    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: null,
    },    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      language: {
        type: String,
        default: 'id',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },    profile: {
      bio: {
        type: String,
        maxlength: 500,
      },
      institution: {
        type: String,
      },
      grade: {
        type: String,
      },
      subjects: [{
        type: String,
      }],
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      trialUsed: {
        type: Boolean,
        default: false,
      },
    },
    statistics: {
      notebooksCreated: {
        type: Number,
        default: 0,
        min: 0,
      },
      quizzesCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      quizzesCreated: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalStudyTime: {
        type: Number,
        default: 0,
        min: 0,
      },
      streakDays: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ userId: 1 });
UserSchema.index({ role: 1 });

// Pre-save middleware untuk hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware untuk generate userId jika belum ada
UserSchema.pre('save', function(next) {
  if (!this.userId) {
    this.userId = generateUserId();
  }
  next();
});

// Instance method untuk compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Static method untuk find by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method untuk find by userId
UserSchema.statics.findByUserId = function(userId: string) {
  return this.findOne({ userId });
};

// Helper function untuk generate userId
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
}

// Virtual untuk mendapatkan ID sebagai string
UserSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;