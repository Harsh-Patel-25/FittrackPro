const NutritionLog = require('../models/nutrition.model');

exports.getNutritionLogs = async (req, res, next) => {
  try {
    const { date, mealType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (mealType) query.mealType = mealType;

    const total = await NutritionLog.countDocuments(query);
    const logs = await NutritionLog.find(query).sort('-date').skip((page - 1) * limit).limit(parseInt(limit));

    res.json({ success: true, data: logs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

exports.getNutritionLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (error) { next(error); }
};

exports.createNutritionLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Meal logged!', data: log });
  } catch (error) { next(error); }
};

exports.updateNutritionLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (error) { next(error); }
};

exports.deleteNutritionLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, message: 'Log deleted' });
  } catch (error) { next(error); }
};

exports.getDailyNutritionSummary = async (req, res, next) => {
  try {
    const { date = new Date() } = req.query;
    const d = new Date(date);
    const start = new Date(d.setHours(0,0,0,0));
    const end = new Date(d.setHours(23,59,59,999));

    const summary = await NutritionLog.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$totalCalories' },
          totalProtein: { $sum: '$totalProtein' },
          totalCarbs: { $sum: '$totalCarbs' },
          totalFat: { $sum: '$totalFat' },
          totalFiber: { $sum: '$totalFiber' },
          totalWater: { $sum: '$water' },
          mealCount: { $sum: 1 }
        }
      }
    ]);

    const mealBreakdown = await NutritionLog.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$mealType', calories: { $sum: '$totalCalories' }, count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { summary: summary[0] || {}, mealBreakdown } });
  } catch (error) { next(error); }
};

exports.getWeeklyNutritionStats = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await NutritionLog.aggregate([
      { $match: { user: req.user._id, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          calories: { $sum: '$totalCalories' },
          protein: { $sum: '$totalProtein' },
          carbs: { $sum: '$totalCarbs' },
          fat: { $sum: '$totalFat' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};
