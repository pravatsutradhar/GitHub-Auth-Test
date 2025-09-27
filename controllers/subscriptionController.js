import Subscription from '../models/Subscription.js';
import Repository from '../models/Repository.js';

export const getUserSubscriptions = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		
		const subscriptions = await Subscription.find({ 
			userId: req.user._id, 
			isActive: true 
		})
		.populate('repositoryId', 'owner name fullName description language stars')
		.sort({ createdAt: -1 });
		
		res.json(subscriptions);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const subscribeToRepository = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		
		const { repositoryId, frequency = 'daily', preferences = {} } = req.body;
		
		if (!repositoryId) {
			return res.status(400).json({ error: 'Repository ID is required' });
		}
		
		// Check if repository exists
		const repository = await Repository.findById(repositoryId);
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		// Check if already subscribed
		const existing = await Subscription.findOne({ 
			userId: req.user._id, 
			repositoryId 
		});
		
		if (existing) {
			// Update existing subscription
			existing.frequency = frequency;
			existing.preferences = preferences;
			existing.isActive = true;
			await existing.save();
			return res.json(existing);
		}
		
		// Create new subscription
		const subscription = new Subscription({
			userId: req.user._id,
			repositoryId,
			frequency,
			preferences,
			isActive: true
		});
		
		await subscription.save();
		await subscription.populate('repositoryId', 'owner name fullName description language stars');
		
		res.status(201).json(subscription);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const unsubscribeFromRepository = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		
		const { subscriptionId } = req.params;
		
		const subscription = await Subscription.findOneAndUpdate(
			{ _id: subscriptionId, userId: req.user._id },
			{ isActive: false },
			{ new: true }
		);
		
		if (!subscription) {
			return res.status(404).json({ error: 'Subscription not found' });
		}
		
		res.json({ message: 'Unsubscribed successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const updateSubscription = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		
		const { subscriptionId } = req.params;
		const { frequency, preferences } = req.body;
		
		const subscription = await Subscription.findOneAndUpdate(
			{ _id: subscriptionId, userId: req.user._id },
			{ frequency, preferences },
			{ new: true }
		).populate('repositoryId', 'owner name fullName description language stars');
		
		if (!subscription) {
			return res.status(404).json({ error: 'Subscription not found' });
		}
		
		res.json(subscription);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const updateUserPreferences = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		
		const { frequency } = req.body;
		
		// Update user's default frequency preference
		req.user.preferences.frequency = frequency;
		await req.user.save();
		
		// Update all active subscriptions to use new frequency
		await Subscription.updateMany(
			{ userId: req.user._id, isActive: true },
			{ frequency }
		);
		
		res.json({ message: 'Preferences updated successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
