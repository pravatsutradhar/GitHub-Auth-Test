// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import morgan from 'morgan';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import session from 'express-session';
// import MongoStore from 'connect-mongo';
// import http from 'http';

// import authRouter from './routes/auth.js';
// import repositoryRouter from './routes/repositories.js';
// import subscriptionRouter from './routes/subscriptions.js';
// import issueRouter from './routes/issues.js';
// import userRouter from './routes/user.js'; // Import user router
// import { configurePassport } from './config/passport.js';
// import passport from 'passport';
// import { connectToDatabase } from './config/db.js';

// const PORT = process.env.PORT || 4000;

// // Create Express app
// const app = express();

// // Middleware
// app.use(morgan('dev'));
// app.use(cors({
// 	origin: ['https://provat-github-auth.netlify.app'],
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// 	credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Session (for Passport or server sessions)
// const sessionConfig = {
// 	secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
// 	resave: false,
// 	saveUninitialized: false,
// 	cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
// };

// // Only use MongoDB store if MongoDB is available
// try {
// 	sessionConfig.store = MongoStore.create({ 
// 		mongoUrl: process.env.MONGODB_URI
// 	});
// } catch (error) {
// 	console.warn('⚠️  Using memory session store (MongoDB not available)');
// }

// app.use(session(sessionConfig));

// // Passport
// configurePassport();
// app.use(passport.initialize());
// app.use(passport.session());

// // Routes
// app.use('/auth', authRouter);
// app.use('/repositories', repositoryRouter);
// app.use('/subscriptions', subscriptionRouter);
// app.use('/issues', issueRouter);
// app.use('/user', userRouter); // Use user router

// app.get('/', (_req, res) => {
// 	res.json('github-auth-backend Running');
// });

// async function start() {
// 	try {
// 		// Try to connect to MongoDB, but don't fail if it's not available
// 		try {
// 			await connectToDatabase(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/github-auth');
// 		} catch (dbError) {
// 			console.warn('⚠️  MongoDB not available - running in limited mode');
// 			console.warn('   Some features may not work without database connection');
// 		}
		
// 		const server = http.createServer(app);
// 		server.listen(PORT, () => {
// 			console.log(`🚀 Backend listening on http://localhost:${PORT}`);
// 		});
// 	} catch (err) {
// 		console.error('❌ Failed to start server:', err.message);
// 		process.exit(1);
// 	}
// }

// start();


import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';

import authRouter from './routes/auth.js';
import repositoryRouter from './routes/repositories.js';
import subscriptionRouter from './routes/subscriptions.js';
import issueRouter from './routes/issues.js';
import userRouter from './routes/user.js';
import { configurePassport } from './config/passport.js';
import passport from 'passport';
import { connectToDatabase } from './config/db.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan('dev'));
app.use(cors({
    origin: ['https://provat-github-auth.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
};

try {
    sessionConfig.store = MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI
    });
} catch (error) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('MongoDB session store is required in production');
    }
    console.warn('⚠️ Using memory session store (MongoDB not available)');
}

app.use(session(sessionConfig));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/repositories', repositoryRouter);
app.use('/subscriptions', subscriptionRouter);
app.use('/issues', issueRouter);
app.use('/user', userRouter);

app.get('/', (_req, res) => {
    res.json('github-auth-backend Running');
});

async function start() {
    try {
        await connectToDatabase(process.env.MONGODB_URI);
        
        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`🚀 Backend listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

start();