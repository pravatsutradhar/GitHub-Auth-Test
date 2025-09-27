import User from '../models/User.js';

export const getMe = (req, res) => {
	if (!req.user) return res.status(401).json({ error: 'unauthorized' });
	res.json({ user: req.user });
};

export const logout = (req, res, next) => {
	req.logout(err => {
		if (err) return next(err);
		req.session.destroy(() => {
			res.clearCookie('connect.sid');
			res.json({ ok: true });
		});
	});
};

export const authFailure = (_req, res) => {
	res.status(401).json({ error: 'authentication_failed' });
};
