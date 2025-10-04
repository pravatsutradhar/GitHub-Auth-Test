import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/github', (req, res, next) => {
    try {
        console.log('🔍 Initiating GitHub OAuth flow');
        passport.authenticate('github', {
            scope: ['read:user', 'user:email']
        })(req, res, next);
    } catch (error) {
        console.error('❌ Error in /auth/github route:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        next(error);
    }
});

router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', {
        successRedirect: process.env.AUTH_SUCCESS_REDIRECT || 'https://provat-github-auth.netlify.app',
        failureRedirect: '/auth/failure'
    })(req, res, next);
});

router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
        githubId: req.user.githubId,
        username: req.user.username,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        isPublic: req.user.isPublic
    });
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('❌ Logout error:', {
                message: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Session destroy error:', {
                    message: err.message,
                    stack: err.stack,
                    timestamp: new Date().toISOString()
                });
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.redirect(process.env.AUTH_SUCCESS_REDIRECT || 'https://provat-github-auth.netlify.app');
        });
    });
});

router.get('/failure', (_req, res) => {
    res.status(401).json({ message: 'Authentication failed' });
});

export default router;