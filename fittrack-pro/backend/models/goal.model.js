const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['calories_in', 'calories_burned', 'protein', 'carbs', 'fat', 'water',
           'steps', 'workout_days', 'workout_duration', 'weight', 'custom'],
    required: true
  },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 300 },
  targetValue: { type: Number, required: true, min: 0 },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, required: true }, // kcal, g, ml, steps, days, min, kg
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'one_time'],
    default: 'daily'
  },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ─── Virtual: Progress percentage ─────────────────────────────────────────────
goalSchema.virtual('progressPercent').get(function() {
  if (!this.targetValue) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

// ─── Virtual: Days remaining ──────────────────────────────────────────────────
goalSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
});

module.exports = mongoose.model('Goal', goalSchema);
