const Workout = require('../models/workout.model');
const NutritionLog = require('../models/nutrition.model');
const User = require('../models/user.model');

// ─── Dashboard Summary ────────────────────────────────────────────────────────
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [todayWorkouts, todayNutrition, weekWorkouts, weekNutrition, user] = await Promise.all([
      Workout.find({ user: req.user._id, date: { $gte: startOfDay, $lte: endOfDay } }),
      NutritionLog.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, calories: { $sum: '$totalCalories' }, protein: { $sum: '$totalProtein' },
          carbs: { $sum: '$totalCarbs' }, fat: { $sum: '$totalFat' }, water: { $sum: '$water' } } }
      ]),
      Workout.aggregate([
        { $match: { user: req.user._id, date: { $gte: weekAgo } } },
        { $group: { _id: null, totalCalories: { $sum: '$totalCaloriesBurned' },
          totalDuration: { $sum: '$duration' }, count: { $sum: 1 } } }
      ]),
      NutritionLog.aggregate([
        { $match: { user: req.user._id, date: { $gte: weekAgo } } },
        { $group: { _id: null, avgCalories: { $avg: '$totalCalories' }, totalCalories: { $sum: '$totalCalories' } } }
      ]),
      User.findById(req.user._id)
    ]);

    const todayCaloriesBurned = todayWorkouts.reduce((s, w) => s + w.totalCaloriesBurned, 0);
    const todayWorkoutDuration = todayWorkouts.reduce((s, w) => s + w.duration, 0);

    res.json({
      success: true,
      data: {
        today: {
          caloriesIn: todayNutrition[0]?.calories || 0,
          caloriesBurned: todayCaloriesBurned,
          protein: todayNutrition[0]?.protein || 0,
          carbs: todayNutrition[0]?.carbs || 0,
          fat: todayNutrition[0]?.fat || 0,
          water: todayNutrition[0]?.water || 0,
          workouts: todayWorkouts.length,
          workoutDuration: todayWorkoutDuration
        },
        week: {
          totalCaloriesBurned: weekWorkouts[0]?.totalCalories || 0,
          totalWorkoutDuration: weekWorkouts[0]?.totalDuration || 0,
          workoutCount: weekWorkouts[0]?.count || 0,
          avgDailyCalories: weekNutrition[0]?.avgCalories || 0
        },
        streak: user.streak,
        totalPoints: user.totalPoints,
        achievements: user.achievements?.slice(-3) || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Monthly Progress ─────────────────────────────────────────────────────────
exports.getMonthlyProgress = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [workoutData, nutritionData] = await Promise.all([
      Workout.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            calories: { $sum: '$totalCaloriesBurned' },
            duration: { $sum: '$duration' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      NutritionLog.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            calories: { $sum: '$totalCalories' },
            protein: { $sum: '$totalProtein' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    res.json({ success: true, data: { workouts: workoutData, nutrition: nutritionData } });
  } catch (error) {
    next(error);
  }
};

// ─── Weekly Insights (AI-like suggestions) ────────────────────────────────────
exports.getWeeklyInsights = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [workoutStats, nutritionStats, user] = await Promise.all([
      Workout.aggregate([
        { $match: { user: req.user._id, date: { $gte: weekAgo } } },
        { $group: { _id: null, count: { $sum: 1 }, avgDuration: { $avg: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' } } }
      ]),
      NutritionLog.aggregate([
        { $match: { user: req.user._id, date: { $gte: weekAgo } } },
        { $group: { _id: null, avgCalories: { $avg: '$totalCalories' },
          avgProtein: { $avg: '$totalProtein' }, avgWater: { $avg: '$water' } } }
      ]),
      User.findById(req.user._id)
    ]);

    const workouts = workoutStats[0] || { count: 0, avgDuration: 0, totalCalories: 0 };
    const nutrition = nutritionStats[0] || { avgCalories: 0, avgProtein: 0, avgWater: 0 };
    const insights = [];

    // Workout frequency insight
    if (workouts.count >= 5) insights.push({ type: 'positive', icon: 'fa-fire', title: 'Crushing It!', message: `You worked out ${workouts.count} times this week. Excellent consistency!` });
    else if (workouts.count >= 3) insights.push({ type: 'neutral', icon: 'fa-dumbbell', title: 'Good Momentum', message: `${workouts.count} workouts this week. Try to hit 5 for optimal results.` });
    else insights.push({ type: 'warning', icon: 'fa-bolt', title: 'Step It Up', message: `Only ${workouts.count} workout(s) this week. Aim for at least 3–4 sessions.` });

    // Protein insight
    if (nutrition.avgProtein < 50) insights.push({ type: 'warning', icon: 'fa-dna', title: 'Low Protein Intake', message: `Your avg protein is ${Math.round(nutrition.avgProtein)}g/day. Aim for 0.8–1g per lb of body weight.` });
    else insights.push({ type: 'positive', icon: 'fa-check-circle', title: 'Great Protein Intake', message: `Averaging ${Math.round(nutrition.avgProtein)}g protein/day. Keep fueling those muscles!` });

    // Water insight
    if (nutrition.avgWater < 2000) insights.push({ type: 'warning', icon: 'fa-droplet', title: 'Hydration Alert', message: `You're averaging ${Math.round(nutrition.avgWater)}ml/day. Aim for 2,500–3,000ml.` });

    // Streak insight
    if (user.streak?.current >= 7) insights.push({ type: 'positive', icon: 'fa-trophy', title: `${user.streak.current}-Day Streak!`, message: 'Incredible dedication! You\'re building a lasting habit.' });

    res.json({ success: true, data: { insights, stats: { workouts, nutrition, streak: user.streak } } });
  } catch (error) {
    next(error);
  }
};
