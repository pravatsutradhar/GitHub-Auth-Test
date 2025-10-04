import Repository from '../models/Repository.js';

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

export const getUserRepositories = async (accessToken) => {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'CodeTriage-Clone'
    };

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid GitHub access token');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded or insufficient permissions');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();
    return repos.map(repo => ({
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics,
      url: repo.url,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
      isArchived: repo.archived,
      isActive: !repo.archived && !repo.disabled,
      githubId: repo.id
    }));
  } catch (error) {
    console.error('❌ Failed to fetch user repositories:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};