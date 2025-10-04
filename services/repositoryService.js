import Repository from '../models/Repository.js';
import { getUserRepositories } from '../services/userGithubService.js';

export const syncUserRepositories = async (accessToken) => {
    try {
        const repos = await getUserRepositories(accessToken);
        
        await Promise.all(repos.map(async (repo) => {
            await Repository.findOneAndUpdate(
                { owner: repo.owner, name: repo.name },
                repo,
                { upsert: true, new: true }
            );
        }));

        return true;
    } catch (error) {
        console.error('❌ Failed to sync repositories:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};