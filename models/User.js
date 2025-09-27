import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		githubId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		email: { type: String },
		avatarUrl: { type: String },
		accessToken: { type: String },
		isPublic: { type: Boolean, default: true },
		emailFrequency: { type: String, enum: ['daily', 'weekly', 'off'], default: 'daily' },
		emailTimeOfDay: { type: String, default: 'not_set' }, // Consider storing as UTC time
		maxIssuesPerDay: { type: Number, default: 50 },
		skipIssuesWithPR: { type: Boolean, default: false },
		favoriteLanguages: { type: [String], default: [] }
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);


