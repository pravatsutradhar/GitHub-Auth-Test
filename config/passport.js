import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

export function configurePassport() {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user || false);
		} catch (err) {
			done(err);
		}
	});

	// Only configure GitHub strategy if credentials are provided
	if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && 
		process.env.GITHUB_CLIENT_ID !== 'your_client_id' && 
		process.env.GITHUB_CLIENT_SECRET !== 'your_client_secret') {
		
		passport.use(
			new GitHubStrategy(
				{
					clientID: process.env.GITHUB_CLIENT_ID,
					clientSecret: process.env.GITHUB_CLIENT_SECRET,
					callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
					scope: ['read:user', 'user:email']
				},
				async (_accessToken, _refreshToken, profile, done) => {
					try {
						const primaryEmail = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
						const existing = await User.findOne({ githubId: profile.id });
						if (existing) {
							return done(null, existing);
						}
						const created = await User.create({
							githubId: profile.id,
							username: profile.username,
							email: primaryEmail,
							avatarUrl: profile.photos?.[0]?.value
						});
						return done(null, created);
					} catch (err) {
						return done(err);
					}
				}
			)
		);
	} else {
		console.warn('⚠️  GitHub OAuth credentials not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file');
	}

	return passport;
}


