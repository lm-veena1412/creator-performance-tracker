const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllPerformanceLogs,
  getPerformanceLogById,
  getPerformanceLogsByCreatorId,
  createPerformanceLog,
  updatePerformanceLog,
  deletePerformanceLog,
  getDashboardStats,
  getMonthlyStats,
  getCreatorMonthlyDetails
} = require('../controllers/performanceController');

router.get('/creator-monthly-stats', authMiddleware, getCreatorMonthlyDetails);
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/monthly-stats', authMiddleware, getMonthlyStats);
router.get('/', authMiddleware, getAllPerformanceLogs);
router.get('/:id', authMiddleware, getPerformanceLogById);
router.get('/creator/:creatorId', authMiddleware, getPerformanceLogsByCreatorId);
router.post('/', authMiddleware, createPerformanceLog);
router.put('/:id', authMiddleware, updatePerformanceLog);
router.delete('/:id', authMiddleware, deletePerformanceLog);

module.exports = router;
