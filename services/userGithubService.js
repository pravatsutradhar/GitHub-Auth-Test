export const getUserRepositories = async (accessToken) => {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${accessToken}`
    };

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers
    });

    if (!response.ok) {
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
    console.error('Failed to fetch user repositories:', error);
    throw error;
  }
};