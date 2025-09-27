import express from 'express';
import { 
	getRepositories, 
	getRepository, 
	addRepository, 
	getLanguages 
} from '../controllers/repositoryController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /repositories - Get all repositories with filters (requires auth)
router.get('/', ensureAuthenticated, getRepositories);

// GET /repositories/languages - Get available programming languages
router.get('/languages', getLanguages);

// GET /repositories/:owner/:name - Get specific repository (requires auth)
router.get('/:owner/:name', ensureAuthenticated, getRepository);

// POST /repositories - Add new repository (admin only)
router.post('/', ensureAuthenticated, addRepository);

export default router;
