const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    enum: ['g', 'ml', 'oz', 'cup', 'serving', 'piece', 'tbsp', 'tsp'],
    default: 'g'
  },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, default: 0 }, // g
  carbs: { type: Number, default: 0 }, // g
  fat: { type: Number, default: 0 }, // g
  fiber: { type: Number, default: 0 }, // g
  sugar: { type: Number, default: 0 } // g
}, { _id: true });

const nutritionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: { type: Date, required: true, default: Date.now, index: true },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'],
    required: true
  },
  foods: [foodItemSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  totalFiber: { type: Number, default: 0 },
  water: { type: Number, default: 0 }, // ml
  notes: { type: String, maxlength: 500 }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
nutritionLogSchema.index({ user: 1, date: -1 });
nutritionLogSchema.index({ user: 1, mealType: 1 });

// ─── Pre-save: Auto-calc totals ───────────────────────────────────────────────
nutritionLogSchema.pre('save', function(next) {
  if (this.foods?.length) {
    this.totalCalories = this.foods.reduce((s, f) => s + (f.calories || 0), 0);
    this.totalProtein  = this.foods.reduce((s, f) => s + (f.protein  || 0), 0);
    this.totalCarbs    = this.foods.reduce((s, f) => s + (f.carbs    || 0), 0);
    this.totalFat      = this.foods.reduce((s, f) => s + (f.fat      || 0), 0);
    this.totalFiber    = this.foods.reduce((s, f) => s + (f.fiber    || 0), 0);
  }
  next();
});

// ─── Virtual: Macros breakdown ────────────────────────────────────────────────
nutritionLogSchema.virtual('macroRatio').get(function() {
  const total = this.totalCalories;
  if (!total) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((this.totalProtein * 4 / total) * 100),
    carbs:   Math.round((this.totalCarbs   * 4 / total) * 100),
    fat:     Math.round((this.totalFat     * 9 / total) * 100)
  };
});

module.exports = mongoose.model('NutritionLog', nutritionLogSchema);
