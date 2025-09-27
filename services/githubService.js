import fetch from 'node-fetch';

class GitHubService {
	constructor() {
		this.baseUrl = 'https://api.github.com';
		this.rateLimit = {
			remaining: 5000,
			reset: Date.now() + 3600000
		};
	}

	async makeRequest(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = {
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'CodeTriage-Clone',
			...options.headers
		};

		// Add GitHub token if available
		if (process.env.GITHUB_TOKEN) {
			headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
		}

		try {
			const response = await fetch(url, { ...options, headers });
			
			// Update rate limit info
			this.rateLimit.remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0');
			this.rateLimit.reset = parseInt(response.headers.get('x-ratelimit-reset') || '0') * 1000;

			if (!response.ok) {
				if (response.status === 403 && this.rateLimit.remaining === 0) {
					throw new Error('GitHub API rate limit exceeded');
				}
				throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('GitHub API request failed:', error.message);
			throw error;
		}
	}

	async getRepository(owner, name) {
		try {
			return await this.makeRequest(`/repos/${owner}/${name}`);
		} catch (error) {
			if (error.message.includes('404')) {
				return null;
			}
			throw error;
		}
	}

	async getRepositoryIssues(owner, name, options = {}) {
		const params = new URLSearchParams({
			state: options.state || 'open',
			per_page: options.per_page || 100,
			page: options.page || 1,
			sort: options.sort || 'updated',
			direction: options.direction || 'desc'
		});

		return await this.makeRequest(`/repos/${owner}/${name}/issues?${params}`);
	}

	async searchRepositories(query, options = {}) {
		const params = new URLSearchParams({
			q: query,
			sort: options.sort || 'stars',
			order: options.order || 'desc',
			per_page: options.per_page || 30,
			page: options.page || 1
		});

		return await this.makeRequest(`/search/repositories?${params}`);
	}

	async getPopularRepositories(language = null, options = {}) {
		let query = 'stars:>1000';
		if (language) {
			query += ` language:${language}`;
		}

		return await this.searchRepositories(query, {
			sort: 'stars',
			order: 'desc',
			...options
		});
	}

	async getRateLimit() {
		return await this.makeRequest('/rate_limit');
	}

	// Helper method to determine issue difficulty based on labels
	static determineDifficulty(labels) {
		const labelNames = labels.map(label => label.name || label).map(name => name.toLowerCase());
		
		if (labelNames.some(name => 
			name.includes('good first issue') || 
			name.includes('beginner') || 
			name.includes('easy') ||
			name.includes('first-timers-only')
		)) {
			return 'beginner';
		}
		
		if (labelNames.some(name => 
			name.includes('help wanted') || 
			name.includes('intermediate') ||
			name.includes('medium')
		)) {
			return 'intermediate';
		}
		
		if (labelNames.some(name => 
			name.includes('advanced') || 
			name.includes('hard') ||
			name.includes('difficult')
		)) {
			return 'advanced';
		}
		
		return 'unknown';
	}
}

export default new GitHubService();
