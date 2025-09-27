import express from 'express';
import { getSettings, updateSettings } from '../controllers/userController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/settings', ensureAuthenticated, getSettings);
router.put('/settings', ensureAuthenticated, updateSettings);

export default router;
