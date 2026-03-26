const Workout = require('../models/workout.model');
const User = require('../models/user.model');

// ─── Get All Workouts ─────────────────────────────────────────────────────────
exports.getWorkouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate, sort = '-date' } = req.query;

    const query = { user: req.user._id };
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Workout.countDocuments(query);
    const workouts = await Workout.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: workouts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Workout ───────────────────────────────────────────────────────
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    res.json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// ─── Create Workout ───────────────────────────────────────────────────────────
exports.createWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.create({ ...req.body, user: req.user._id });

    // Update user streak
    const user = await User.findById(req.user._id);
    await user.updateStreak();
    await awardPoints(user, 10);

    res.status(201).json({ success: true, message: 'Workout logged!', data: workout });
  } catch (error) {
    next(error);
  }
};

// ─── Update Workout ───────────────────────────────────────────────────────────
exports.updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    res.json({ success: true, message: 'Workout updated', data: workout });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Workout ───────────────────────────────────────────────────────────
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Weekly Stats Aggregation ─────────────────────────────────────────────────
exports.getWeeklyStats = async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Workout.aggregate([
      { $match: { user: req.user._id, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          totalDuration: { $sum: '$duration' },
          workoutCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const typeBreakdown = await Workout.aggregate([
      { $match: { user: req.user._id, date: { $gte: weekAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalCalories: { $sum: '$totalCaloriesBurned' } } }
    ]);

    const totals = await Workout.aggregate([
      { $match: { user: req.user._id, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$totalCaloriesBurned' },
          totalDuration: { $sum: '$duration' },
          workoutCount: { $sum: 1 },
          avgIntensity: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$intensity', 'low'] }, then: 1 },
              { case: { $eq: ['$intensity', 'moderate'] }, then: 2 },
              { case: { $eq: ['$intensity', 'high'] }, then: 3 },
              { case: { $eq: ['$intensity', 'extreme'] }, then: 4 }
            ], default: 2
          }}}
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailyBreakdown: stats,
        typeBreakdown,
        totals: totals[0] || { totalCalories: 0, totalDuration: 0, workoutCount: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Award Points ─────────────────────────────────────────────────────
async function awardPoints(user, points) {
  user.totalPoints = (user.totalPoints || 0) + points;
  await user.save();
}
