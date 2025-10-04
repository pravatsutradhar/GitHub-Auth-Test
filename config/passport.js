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
            console.error('❌ Deserialize user error:', err.message);
            done(err);
        }
    });

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && 
        process.env.GITHUB_CLIENT_ID !== 'Ov23li33cTAyJtYspV1Y' && 
        process.env.GITHUB_CLIENT_SECRET !== '0e32344711adaa8c7523fb099fd1a45d60a63297') {
        
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
                        const primaryEmail = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
                        let user = await User.findOne({ githubId: profile.id });
                        
                        if (user) {
                            user.username = profile.username;
                            user.email = primaryEmail;
                            user.avatarUrl = profile.photos?.[0]?.value;
                            user.accessToken = accessToken;
                            await user.save();
                        } else {
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
                            await syncUserRepositories(accessToken);
                        } catch (syncError) {
                            console.error('⚠️ Failed to sync repositories during authentication:', {
                                error: syncError.message,
                                stack: syncError.stack
                            });
                            // Continue authentication even if sync fails
                        }

                        return done(null, user);
                    } catch (err) {
                        console.error('❌ GitHub OAuth callback error:', {
                            error: err.message,
                            stack: err.stack
                        });
                        return done(err);
                    }
                }
            )
        );
    } else {
        console.warn('⚠️ GitHub OAuth credentials not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file');
    }

    return passport;
}