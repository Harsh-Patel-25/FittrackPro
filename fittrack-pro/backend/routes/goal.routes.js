const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.patch('/:id/progress', goalController.updateGoalProgress);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
