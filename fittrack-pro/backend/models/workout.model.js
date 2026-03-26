const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'hiit', 'sports'],
    required: true
  },
  sets: { type: Number, min: 0 },
  reps: { type: Number, min: 0 },
  weight: { type: Number, min: 0 }, // kg
  duration: { type: Number, min: 0 }, // minutes
  distance: { type: Number, min: 0 }, // km
  caloriesBurned: { type: Number, min: 0, default: 0 },
  notes: { type: String, maxlength: 500 }
}, { _id: true });

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'hiit', 'mixed', 'sports'],
    required: true
  },
  exercises: [exerciseSchema],
  date: { type: Date, required: true, default: Date.now, index: true },
  duration: { type: Number, required: true, min: 1 }, // total minutes
  totalCaloriesBurned: { type: Number, default: 0 },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'extreme'],
    default: 'moderate'
  },
  mood: {
    type: String,
    enum: ['terrible', 'bad', 'okay', 'good', 'great'],
    default: 'good'
  },
  notes: { type: String, maxlength: 1000 },
  isCompleted: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, type: 1 });

// ─── Pre-save: Auto-calc total calories ───────────────────────────────────────
workoutSchema.pre('save', function(next) {
  if (this.exercises?.length) {
    this.totalCaloriesBurned = this.exercises.reduce(
      (sum, ex) => sum + (ex.caloriesBurned || 0), 0
    );
  }
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
