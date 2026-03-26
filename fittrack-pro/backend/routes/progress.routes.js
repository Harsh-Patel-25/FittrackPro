const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', progressController.getDashboardSummary);
router.get('/monthly', progressController.getMonthlyProgress);
router.get('/insights', progressController.getWeeklyInsights);

module.exports = router;
