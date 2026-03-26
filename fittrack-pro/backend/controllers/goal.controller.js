const Goal = require('../models/goal.model');

exports.getGoals = async (req, res, next) => {
  try {
    const { isActive, period } = req.query;
    const query = { user: req.user._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (period) query.period = period;

    const goals = await Goal.find(query).sort('-createdAt');
    res.json({ success: true, data: goals });
  } catch (error) { next(error); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Goal set!', data: goal });
  } catch (error) { next(error); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (error) { next(error); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};

exports.updateGoalProgress = async (req, res, next) => {
  try {
    const { currentValue } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.currentValue = currentValue;
    if (currentValue >= goal.targetValue) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) { next(error); }
};
