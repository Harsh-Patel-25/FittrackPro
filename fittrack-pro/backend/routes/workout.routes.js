const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', workoutController.getWorkouts);
router.get('/weekly-stats', workoutController.getWeeklyStats);
router.get('/:id', workoutController.getWorkout);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;
