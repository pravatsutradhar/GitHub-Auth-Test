import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
	{
		repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
		issueNumber: { type: Number, required: true },
		title: { type: String, required: true },
		body: String,
		url: String,
		htmlUrl: String,
		labels: [String],
		state: { type: String, enum: ['open', 'closed'], default: 'open' },
		assignee: String,
		author: String,
		comments: { type: Number, default: 0 },
		difficulty: { 
			type: String, 
			enum: ['beginner', 'intermediate', 'advanced', 'unknown'], 
			default: 'unknown' 
		},
		githubId: { type: Number, unique: true, sparse: true },
		lastSentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who received this issue
		lastUpdated: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

// Compound index for efficient queries
issueSchema.index({ repositoryId: 1, issueNumber: 1 }, { unique: true });
issueSchema.index({ repositoryId: 1, state: 1, difficulty: 1 });
issueSchema.index({ labels: 1, state: 1 });
issueSchema.index({ lastUpdated: -1 });

export default mongoose.model('Issue', issueSchema);
