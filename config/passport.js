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
            console.error('❌ Deserialize user error:', {
                message: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });
            done(err);
        }
    });

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        console.error('❌ GitHub OAuth credentials missing: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
        return passport;
    }

    if (process.env.GITHUB_CLIENT_ID === 'your_client_id' || 
        process.env.GITHUB_CLIENT_SECRET === 'your_client_secret') {
        console.error('❌ Invalid GitHub OAuth credentials: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be updated');
        return passport;
    }

    try {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET,
                    callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://git-hub-auth-test.vercel.app/auth/github/callback',
                    scope: ['read:user', 'user:email']
                },
                async (accessToken, _refreshToken, profile, done) => {
                    try {
                        console.log('🔍 Processing GitHub OAuth callback for user:', profile.id);
                        const primaryEmail = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
                        let user = await User.findOne({ githubId: profile.id });
                        
                        if (user) {
                            console.log('🔄 Updating existing user:', user.username);
                            user.username = profile.username;
                            user.email = primaryEmail;
                            user.avatarUrl = profile.photos?.[0]?.value;
                            user.accessToken = accessToken;
                            await user.save();
                        } else {
                            console.log('🆕 Creating new user:', profile.username);
                            user = await User.create({
                                githubId: profile.id,
                                username: profile.username,
                                email: primaryEmail,
                                avatarUrl: profile.photos?.[0]?.value,
                                accessToken
                            });
                        }

                        const { syncUserRepositories } = await import('../services/repositoryService.js');
                        try {
                            console.log('🔄 Syncing repositories for user:', user.username);
                            await syncUserRepositories(accessToken);
                        } catch (syncError) {
                            console.error('⚠️ Failed to sync repositories during authentication:', {
                                error: syncError.message,
                                stack: syncError.stack,
                                timestamp: new Date().toISOString()
                            });
                        }

                        return done(null, user);
                    } catch (err) {
                        console.error('❌ GitHub OAuth callback error:', {
                            error: err.message,
                            stack: err.stack,
                            timestamp: new Date().toISOString()
                        });
                        return done(err);
                    }
                }
            )
        );
        console.log('✅ GitHub OAuth strategy initialized');
    } catch (error) {
        console.error('❌ Failed to initialize GitHub OAuth strategy:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    return passport;
}