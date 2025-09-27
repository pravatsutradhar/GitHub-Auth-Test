import Issue from '../models/Issue.js';
import Repository from '../models/Repository.js';

export const getRepositoryIssues = async (req, res) => {
	try {
		const { owner, name } = req.params;
		const { state = 'open', difficulty, labels, page = 1, limit = 20 } = req.query;
		
		// Find repository
		const repository = await Repository.findOne({ owner, name });
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		// Build query
		const query = { repositoryId: repository._id, state };
		
		if (difficulty && difficulty !== 'all') {
			query.difficulty = difficulty;
		}
		
		if (labels) {
			const labelArray = labels.split(',');
			query.labels = { $in: labelArray };
		}
		
		const issues = await Issue.find(query)
			.sort({ lastUpdated: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.select('-__v');
			
		const total = await Issue.countDocuments(query);
		
		res.json({
			issues,
			repository: {
				owner: repository.owner,
				name: repository.name,
				fullName: repository.fullName
			},
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

export const getIssue = async (req, res) => {
	try {
		const { owner, name, issueNumber } = req.params;
		
		// Find repository
		const repository = await Repository.findOne({ owner, name });
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		// Find issue
		const issue = await Issue.findOne({ 
			repositoryId: repository._id, 
			issueNumber: parseInt(issueNumber) 
		});
		
		if (!issue) {
			return res.status(404).json({ error: 'Issue not found' });
		}
		
		res.json({
			issue,
			repository: {
				owner: repository.owner,
				name: repository.name,
				fullName: repository.fullName
			}
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getAvailableLabels = async (req, res) => {
	try {
		const { owner, name } = req.params;
		
		// Find repository
		const repository = await Repository.findOne({ owner, name });
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		// Get all unique labels from issues in this repository
		const labels = await Issue.distinct('labels', { 
			repositoryId: repository._id,
			state: 'open'
		});
		
		res.json(labels.sort());
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getDifficultyLevels = async (req, res) => {
	try {
		const { owner, name } = req.params;
		
		// Find repository
		const repository = await Repository.findOne({ owner, name });
		if (!repository) {
			return res.status(404).json({ error: 'Repository not found' });
		}
		
		// Get difficulty distribution
		const difficulties = await Issue.aggregate([
			{ $match: { repositoryId: repository._id, state: 'open' } },
			{ $group: { _id: '$difficulty', count: { $sum: 1 } } },
			{ $sort: { _id: 1 } }
		]);
		
		res.json(difficulties);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
