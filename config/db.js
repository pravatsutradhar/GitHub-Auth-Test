import mongoose from 'mongoose';

export async function connectToDatabase(mongoUri) {
	if (!mongoUri) {
		throw new Error('MONGODB_URI is not defined');
	}
	
	mongoose.set('strictQuery', true);
	
	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
		});
		console.log('✅ Connected to MongoDB');
		return mongoose.connection;
	} catch (error) {
		console.error('❌ MongoDB connection failed:', error.message);
		console.log('💡 Make sure MongoDB is running on your system');
		console.log('   - Windows: Start MongoDB service or run "mongod"');
		console.log('   - macOS: brew services start mongodb-community');
		console.log('   - Linux: sudo systemctl start mongod');
		throw error;
	}
}
