import mongoose from 'mongoose';
import { setTimeout } from 'timers/promises';

export async function connectToDatabase(mongoUri) {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required for database connectivity');
    }
    
    mongoose.set('strictQuery', true);
    
    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
        try {
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10,
                connectTimeoutMS: 10000
            });
            console.log('✅ Connected to MongoDB');
            return mongoose.connection;
        } catch (error) {
            console.error(`❌ MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, error.message);
            if (attempt === maxRetries) {
                throw new Error('MongoDB connection failed after maximum retries: ' + error.message);
            }
            await setTimeout(1000 * attempt); // Exponential backoff
            attempt++;
        }
    }
}