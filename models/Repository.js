import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
	{
		owner: { type: String, required: true, index: true },
		name: { type: String, required: true, index: true },
		fullName: { type: String, required: true, unique: true, index: true }, // owner/name
		description: String,
		language: { type: String, index: true },
		stars: { type: Number, default: 0 },
		forks: { type: Number, default: 0 },
		topics: [String],
		url: String,
		htmlUrl: String,
		cloneUrl: String,
		defaultBranch: { type: String, default: 'main' },
		isArchived: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
		lastSynced: { type: Date, default: Date.now },
		githubId: { type: Number, unique: true, sparse: true }
	},
	{ timestamps: true }
);

// Compound index for efficient queries
repositorySchema.index({ owner: 1, name: 1 });
repositorySchema.index({ language: 1, stars: -1 });
repositorySchema.index({ isActive: 1, isArchived: 1 });

export default mongoose.model('Repository', repositorySchema);
