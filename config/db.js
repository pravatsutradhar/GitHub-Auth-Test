import mongoose from 'mongoose';

export async function connectToDatabase(mongoUri) {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required for database connectivity');
    }
    
    mongoose.set('strictQuery', true);
    
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
}