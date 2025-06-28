const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model schema
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

// Create model
const User = mongoose.model('User', UserSchema);

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genedu';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@genedu.com',
      role: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@genedu.com');
      console.log('Password: admin123');
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      userId: 'admin_' + Date.now(),
      email: 'admin@genedu.com',
      password: 'admin123',
      name: 'Admin GenEdu',
      role: 'admin',
      isEmailVerified: true,
      profile: {
        bio: 'System Administrator for GenEdu platform',
        institution: 'GenEdu Organization',
        timezone: 'UTC'
      },
      onboardingCompleted: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@genedu.com');
    console.log('🔒 Password: admin123');
    console.log('');
    console.log('🌐 Access admin panel at: http://localhost:3000/admin');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
