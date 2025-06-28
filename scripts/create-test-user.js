const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  isEmailVerified: { type: Boolean, default: false },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  profile: {
    bio: String,
    institution: String,
    grade: String,
    subjects: [String],
    timezone: { type: String, default: 'UTC' },
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      quiz: { type: Boolean, default: true },
      notebook: { type: Boolean, default: true }
    }
  },
  statistics: {
    notebooksCreated: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    quizzesCreated: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired'], default: 'active' },
    trialUsed: { type: Boolean, default: false }
  },
  onboardingCompleted: { type: Boolean, default: false }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.wl38n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@genedu.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create test user
    const testUser = new User({
      userId: 'user_' + Date.now(),
      email: 'test@genedu.com',
      password: 'password123',
      name: 'Test User',
      role: 'student',
      isEmailVerified: true,
      profile: {
        bio: 'Test user for GenEdu platform',
        institution: 'Test University',
        grade: '12',
        subjects: ['Mathematics', 'Science'],
        timezone: 'UTC'
      },
      onboardingCompleted: true
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    console.log('Email: test@genedu.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();
