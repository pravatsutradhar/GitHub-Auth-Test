import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		githubId: { type: String, index: true, unique: true },
		username: { type: String, index: true },
		email: { type: String, index: true },
		avatarUrl: String,
		accessToken: String, // store only if necessary; consider short-lived usage or encrypt
		preferences: {
			frequency: { type: String, enum: ['daily', 'weekly', 'paused'], default: 'daily' }
		}
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);


