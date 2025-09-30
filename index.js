import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';

import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import repositoryRouter from './routes/repositories.js';
import subscriptionRouter from './routes/subscriptions.js';
import issueRouter from './routes/issues.js';
import userRouter from './routes/user.js'; // Import user router
import { configurePassport } from './config/passport.js';
import passport from 'passport';
import { connectToDatabase } from './config/db.js';

const PORT = process.env.PORT || 4000;

// Create Express app
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
	origin: ['https://provat-github-auth.netlify.app'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session (for Passport or server sessions)
const sessionConfig = {
	secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
	resave: false,
	saveUninitialized: false,
	cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
};

// Only use MongoDB store if MongoDB is available
try {
	sessionConfig.store = MongoStore.create({ 
		mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/github-auth' 
	});
} catch (error) {
	console.warn('⚠️  Using memory session store (MongoDB not available)');
}

app.use(session(sessionConfig));

// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/repositories', repositoryRouter);
app.use('/subscriptions', subscriptionRouter);
app.use('/issues', issueRouter);
app.use('/user', userRouter); // Use user router

app.get('/', (_req, res) => {
	res.json({ ok: true, name: 'github-auth-backend Running' });
});

async function start() {
	try {
		// Try to connect to MongoDB, but don't fail if it's not available
		try {
			await connectToDatabase(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/github-auth');
		} catch (dbError) {
			console.warn('⚠️  MongoDB not available - running in limited mode');
			console.warn('   Some features may not work without database connection');
		}
		
		const server = http.createServer(app);
		server.listen(PORT, () => {
			console.log(`🚀 Backend listening on http://localhost:${PORT}`);
			console.log(`📋 Available routes:`);
			console.log(`   GET  /health - Health check`);
			console.log(`   GET  /auth/github - GitHub OAuth login`);
			console.log(`   GET  /auth/me - Get current user`);
			console.log(`   POST /auth/logout - Logout`);
			console.log(`   GET  /repositories - Browse repositories`);
			console.log(`   GET  /repositories/:owner/:name - Get repository details`);
			console.log(`   GET  /issues/:owner/:name - Get repository issues`);
			console.log(`   GET  /subscriptions - Get user subscriptions`);
			console.log(`   POST /subscriptions - Subscribe to repository`);
			console.log(`\n💡 Note: Start MongoDB for full functionality`);
		});
	} catch (err) {
		console.error('❌ Failed to start server:', err.message);
		console.log('\n🔧 Troubleshooting:');
		console.log('1. Make sure MongoDB is running');
		console.log('2. Check your .env file has correct MONGODB_URI');
		console.log('3. For GitHub OAuth, set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
		process.exit(1);
	}
}

start();
