import express from 'express';
import { 
	getRepositoryIssues,
	getIssue,
	getAvailableLabels,
	getDifficultyLevels
} from '../controllers/issueController.js';

const router = express.Router();

// GET /issues/:owner/:name - Get issues for a repository
router.get('/:owner/:name', getRepositoryIssues);

// GET /issues/:owner/:name/labels - Get available labels for a repository
router.get('/:owner/:name/labels', getAvailableLabels);

// GET /issues/:owner/:name/difficulties - Get difficulty distribution
router.get('/:owner/:name/difficulties', getDifficultyLevels);

// GET /issues/:owner/:name/:issueNumber - Get specific issue
router.get('/:owner/:name/:issueNumber', getIssue);

export default router;
