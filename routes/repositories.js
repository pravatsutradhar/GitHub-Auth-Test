import express from 'express';
import { 
	getRepositories, 
	getRepository, 
	addRepository, 
	getLanguages 
} from '../controllers/repositoryController.js';

const router = express.Router();

// GET /repositories - Get all repositories with filters
router.get('/', getRepositories);

// GET /repositories/languages - Get available programming languages
router.get('/languages', getLanguages);

// GET /repositories/:owner/:name - Get specific repository
router.get('/:owner/:name', getRepository);

// POST /repositories - Add new repository (admin only for now)
router.post('/', addRepository);

export default router;
