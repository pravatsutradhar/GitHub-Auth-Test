import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
		frequency: { 
			type: String, 
			enum: ['daily', 'weekly', 'paused'], 
			default: 'daily' 
		},
		isActive: { type: Boolean, default: true },
		preferences: {
			languages: [String], // Filter by programming languages
			difficulty: [String], // Filter by difficulty levels
			labels: [String] // Filter by specific labels
		},
		lastSent: { type: Date }, // Last time an issue was sent to this user for this repo
		createdAt: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

// Compound index to prevent duplicate subscriptions
subscriptionSchema.index({ userId: 1, repositoryId: 1 }, { unique: true });
subscriptionSchema.index({ userId: 1, isActive: 1, frequency: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
