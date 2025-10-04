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
    cookie: { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
};

try {
    sessionConfig.store = MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native',
        retry: {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000
        }
    });
    console.log('✅ MongoDB session store initialized');
} catch (error) {
    console.error('❌ Failed to initialize MongoDB session store:', error.message);
    if (process.env.NODE_ENV === 'production') {
        throw new Error('MongoDB session store is required in production: ' + error.message);
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

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    });
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