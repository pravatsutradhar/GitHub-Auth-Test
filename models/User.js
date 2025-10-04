// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
// 	{
// 		githubId: { type: String, required: true, unique: true },
// 		username: { type: String, required: true },
// 		email: { type: String },
// 		avatarUrl: { type: String },
// 		accessToken: { type: String },
// 		isPublic: { type: Boolean, default: true },
// 		emailFrequency: { type: String, enum: ['daily', 'weekly', 'off'], default: 'daily' },
// 		emailTimeOfDay: { type: String, default: 'not_set' }, // Consider storing as UTC time
// 		maxIssuesPerDay: { type: Number, default: 50 },
// 		skipIssuesWithPR: { type: Boolean, default: false },
// 		favoriteLanguages: { type: [String], default: [] }
// 	},
// 	{ timestamps: true }
// );

// export default mongoose.model('User', userSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        githubId: { type: String, required: true, unique: true },
        username: { type: String, required: true },
        email: { type: String },
        avatarUrl: { type: String },
        accessToken: { type: String },
        isPublic: { type: Boolean, default: true },
        emailFrequency: { type: String, enum: ['daily', 'weekly', 'off'], default: 'daily' },
        emailTimeOfDay: { type: String, default: 'not_set' },
        maxIssuesPerDay: { type: Number, default: 50 },
        skipIssuesWithPR: { type: Boolean, default: false },
        favoriteLanguages: { type: [String], default: [] }
    },
    { timestamps: true }
);

userSchema.pre('save', async function(next) {
    if (this.isModified('accessToken') && this.accessToken) {
        try {
            this.accessToken = await bcrypt.hash(this.accessToken, 10);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

export default mongoose.model('User', userSchema);