const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  profile: {
    age: { type: Number, min: 13, max: 120 },
    weight: { type: Number, min: 20, max: 500 }, // kg
    height: { type: Number, min: 50, max: 300 }, // cm
    gender: { type: String, enum: ['male', 'female', 'other'] },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    fitnessGoal: {
      type: String,
      enum: ['lose_weight', 'maintain', 'gain_muscle', 'improve_endurance'],
      default: 'maintain'
    }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: null }
  },
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  totalPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('bmi').get(function() {
  if (this.profile?.weight && this.profile?.height) {
    const heightM = this.profile.height / 100;
    return parseFloat((this.profile.weight / (heightM * heightM)).toFixed(1));
  }
  return null;
});

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStreak = async function() {
  const now = new Date();
  const last = this.streak.lastActivity;
  
  if (!last) {
    this.streak.current = 1;
  } else {
    const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      this.streak.current += 1;
    } else if (daysDiff > 1) {
      this.streak.current = 1;
    }
  }
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  this.streak.lastActivity = now;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
