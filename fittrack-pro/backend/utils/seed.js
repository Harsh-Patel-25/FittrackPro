/**
 * FitTrack Pro – Database Seed Script
 * Run: node utils/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Workout = require('../models/workout.model');
const NutritionLog = require('../models/nutrition.model');
const Goal = require('../models/goal.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack_pro';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean existing demo data
  await User.deleteOne({ email: 'demo@fittrack.com' });

  // Create demo user
  const user = await User.create({
    name: 'Alex Johnson',
    email: 'demo@fittrack.com',
    password: 'demo123',
    profile: {
      age: 28, weight: 75, height: 178,
      gender: 'male', activityLevel: 'active', fitnessGoal: 'gain_muscle'
    },
    streak: { current: 5, longest: 12, lastActivity: new Date() },
    totalPoints: 250
  });

  console.log('👤 Demo user created:', user.email);

  // Create workouts for the past 7 days
  const workoutData = [
    { title: 'Morning Push Day', type: 'strength', intensity: 'high', mood: 'great', duration: 65,
      exercises: [
        { name: 'Bench Press', category: 'strength', sets: 4, reps: 8, weight: 80, caloriesBurned: 80 },
        { name: 'Overhead Press', category: 'strength', sets: 3, reps: 10, weight: 50, caloriesBurned: 60 },
        { name: 'Tricep Dips', category: 'strength', sets: 3, reps: 12, caloriesBurned: 40 }
      ]},
    { title: 'Evening Run', type: 'cardio', intensity: 'moderate', mood: 'good', duration: 40,
      exercises: [{ name: '5K Run', category: 'cardio', duration: 40, distance: 5, caloriesBurned: 320 }]},
    { title: 'Pull Day', type: 'strength', intensity: 'high', mood: 'good', duration: 55,
      exercises: [
        { name: 'Deadlift', category: 'strength', sets: 4, reps: 5, weight: 120, caloriesBurned: 100 },
        { name: 'Pull-ups', category: 'strength', sets: 4, reps: 8, caloriesBurned: 60 },
        { name: 'Barbell Row', category: 'strength', sets: 3, reps: 10, weight: 70, caloriesBurned: 70 }
      ]},
    { title: 'HIIT Session', type: 'hiit', intensity: 'extreme', mood: 'great', duration: 30,
      exercises: [{ name: 'HIIT Circuit', category: 'hiit', duration: 30, caloriesBurned: 380 }]}
  ];

  for (let i = 0; i < workoutData.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await Workout.create({ ...workoutData[i], user: user._id, date });
  }
  console.log('🏋️  Workouts seeded');

  // Create nutrition logs
  const nutritionData = [
    { mealType: 'breakfast', foods: [
      { name: 'Oats', quantity: 80, unit: 'g', calories: 300, protein: 10, carbs: 55, fat: 5 },
      { name: 'Protein Shake', quantity: 1, unit: 'serving', calories: 180, protein: 30, carbs: 8, fat: 3 }
    ], water: 500 },
    { mealType: 'lunch', foods: [
      { name: 'Chicken Breast', quantity: 200, unit: 'g', calories: 330, protein: 62, carbs: 0, fat: 7 },
      { name: 'Brown Rice', quantity: 150, unit: 'g', calories: 195, protein: 4, carbs: 42, fat: 1 },
      { name: 'Broccoli', quantity: 100, unit: 'g', calories: 35, protein: 3, carbs: 7, fat: 0 }
    ], water: 500 },
    { mealType: 'dinner', foods: [
      { name: 'Salmon', quantity: 180, unit: 'g', calories: 360, protein: 40, carbs: 0, fat: 22 },
      { name: 'Sweet Potato', quantity: 200, unit: 'g', calories: 180, protein: 3, carbs: 42, fat: 0 },
      { name: 'Salad', quantity: 100, unit: 'g', calories: 30, protein: 2, carbs: 6, fat: 0 }
    ], water: 500 }
  ];

  for (const nd of nutritionData) {
    await NutritionLog.create({ ...nd, user: user._id, date: new Date() });
  }
  console.log('🥗 Nutrition logs seeded');

  // Create goals
  const goalsData = [
    { title: 'Daily Protein Target', type: 'protein', targetValue: 150, currentValue: 112, unit: 'g', period: 'daily' },
    { title: 'Weekly Workouts', type: 'workout_days', targetValue: 5, currentValue: 4, unit: 'sessions', period: 'weekly' },
    { title: 'Daily Calorie Goal', type: 'calories_in', targetValue: 2500, currentValue: 1868, unit: 'kcal', period: 'daily' },
    { title: 'Burn 3000 kcal/week', type: 'calories_burned', targetValue: 3000, currentValue: 1860, unit: 'kcal', period: 'weekly' }
  ];

  for (const gd of goalsData) {
    await Goal.create({ ...gd, user: user._id });
  }
  console.log('🎯 Goals seeded');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:    demo@fittrack.com');
  console.log('🔑 Password: demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
