const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', nutritionController.getNutritionLogs);
router.get('/daily-summary', nutritionController.getDailyNutritionSummary);
router.get('/weekly-stats', nutritionController.getWeeklyNutritionStats);
router.get('/:id', nutritionController.getNutritionLog);
router.post('/', nutritionController.createNutritionLog);
router.put('/:id', nutritionController.updateNutritionLog);
router.delete('/:id', nutritionController.deleteNutritionLog);

module.exports = router;
