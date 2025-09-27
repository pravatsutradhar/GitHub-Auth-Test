import express from 'express';
import { 
	getUserSubscriptions,
	subscribeToRepository,
	unsubscribeFromRepository,
	updateSubscription,
	updateUserPreferences
} from '../controllers/subscriptionController.js';

const router = express.Router();

// GET /subscriptions - Get user's subscriptions
router.get('/', getUserSubscriptions);

// POST /subscriptions - Subscribe to a repository
router.post('/', subscribeToRepository);

// PUT /subscriptions/preferences - Update user's default preferences
router.put('/preferences', updateUserPreferences);

// PUT /subscriptions/:subscriptionId - Update specific subscription
router.put('/:subscriptionId', updateSubscription);

// DELETE /subscriptions/:subscriptionId - Unsubscribe from repository
router.delete('/:subscriptionId', unsubscribeFromRepository);

export default router;
