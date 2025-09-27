import mongoose from 'mongoose';

const sentLogSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
		repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
		emailSent: { type: Boolean, default: false },
		sentAt: { type: Date, default: Date.now },
		emailStatus: { 
			type: String, 
			enum: ['sent', 'failed', 'bounced', 'pending'], 
			default: 'pending' 
		},
		errorMessage: String,
		retryCount: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

// Compound index for efficient queries
sentLogSchema.index({ userId: 1, sentAt: -1 });
sentLogSchema.index({ issueId: 1, userId: 1 }, { unique: true }); // Prevent duplicate sends
sentLogSchema.index({ emailStatus: 1, sentAt: -1 });

export default mongoose.model('SentLog', sentLogSchema);
