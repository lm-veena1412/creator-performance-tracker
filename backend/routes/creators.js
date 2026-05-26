const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllCreators,
  getCreatorById,
  createCreator,
  updateCreator,
  deleteCreator
} = require('../controllers/creatorController');

router.get('/', authMiddleware, getAllCreators);
router.get('/:id', authMiddleware, getCreatorById);
router.post('/', authMiddleware, createCreator);
router.put('/:id', authMiddleware, updateCreator);
router.delete('/:id', authMiddleware, deleteCreator);

module.exports = router;
