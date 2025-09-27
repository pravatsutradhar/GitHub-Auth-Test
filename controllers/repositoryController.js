import Repository from '../models/Repository.js';
import Subscription from '../models/Subscription.js';
import githubService from '../services/githubService.js';

export const getRepositories = async (req, res) => {
	try {
		// If user is not authenticated, we can't show subscription status
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { language, search, page = 1, limit = 20, sort = 'stars' } = req.query;
		
		// First, get all repositories the user is subscribed to
		const userSubscriptions = await Subscription.find({ 
			userId: req.user._id,
			isActive: true 
		}).select('repositoryId');
		
		const subscribedRepoIds = userSubscriptions.map(sub => sub.repositoryId);
		
		// Build repository query
		const query = { isActive: true, isArchived: false };
		
		if (language && language !== 'all') {
			query.language = language;
		}
		
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ owner: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}
		
		const sortOptions = {};
		if (sort === 'stars') sortOptions.stars = -1;
		if (sort === 'forks') sortOptions.forks = -1;
		if (sort === 'recent') sortOptions.createdAt = -1;
		
		// Get repositories
		const repositories = await Repository.find(query)
			.sort(sortOptions)
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.select('owner name stars githubId');
			
		// Add subscription status to each repository
		const reposWithStatus = repositories.map(repo => ({
			owner: repo.owner,
			name: repo.name,
			stars: repo.stars || 0,
			issues: 0, // We'll update this with GitHub API
			isSubscribed: subscribedRepoIds.some(id => id.equals(repo._id))
		}));

		// Get fresh issue counts from GitHub
		await Promise.all(reposWithStatus.map(async (repo) => {
			try {
				const githubRepo = await githubService.getRepository(repo.owner, repo.name);
				repo.issues = githubRepo.open_issues_count || 0;
			} catch (err) {
				console.error(`Failed to get issue count for ${repo.owner}/${repo.name}:`, err.message);
			}
		}));
			
		const total = await Repository.countDocuments(query);
		
		res.json({
			repositories: reposWithStatus,
			pagination: {
				current: parseInt(page),
				pages: Math.ceil(total / limit),
				total
			}
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getRepository = async (req, res) => {
	try {
		const { owner, name } = req.params;
		const repository = await Repository.findOne({ owner, name });
		
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		res.json(repository);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const addRepository = async (req, res) => {
	try {
		const { owner, name } = req.body;
		
		if (!owner || !name) {
			return res.status(400).json({ error: 'Owner and name are required' });
		}
		
		const fullName = `${owner}/${name}`;
		
		// Check if repository already exists
		const existing = await Repository.findOne({ fullName });
		if (existing) {
			return res.status(409).json({ error: 'Repository already exists' });
		}
		
		// Create new repository (will be populated by sync job)
		const repository = new Repository({
			owner,
			name,
			fullName,
			isActive: true
		});
		
		await repository.save();
		
		res.status(201).json(repository);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getLanguages = async (req, res) => {
	try {
		const languages = await Repository.distinct('language', { 
			isActive: true, 
			language: { $ne: null } 
		});
		
		res.json(languages.sort());
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
