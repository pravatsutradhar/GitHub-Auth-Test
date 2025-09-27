import express from 'express';
import passport from 'passport';
import { getMe, logout, authFailure } from '../controllers/authController.js';

const router = express.Router();

router.get('/github', (req, res, next) => {
	// Check if GitHub OAuth is configured
	if (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'your_client_id') {
		return res.status(503).json({ 
			error: 'GitHub OAuth not configured', 
			message: 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file' 
		});
	}
	passport.authenticate('github', { scope: ['read:user', 'user:email'] })(req, res, next);
});

router.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/auth/failure' }),
	(req, res) => {
		res.redirect(process.env.AUTH_SUCCESS_REDIRECT || 'http://localhost:3000');
	}
);

router.get('/me', getMe);
router.post('/logout', logout);
router.get('/failure', authFailure);

export default router;


