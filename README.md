# Backend (GitHub Auth Clone)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   - Windows: Start MongoDB service or run `mongod`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Run the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

The `.env` file is already created with default values. Update these:

- `PORT=4000` - Server port
- `MONGODB_URI=mongodb://127.0.0.1:27017/github-auth` - MongoDB connection
- `SESSION_SECRET=change_me_session_secret` - Session secret (change this!)
- `CORS_ORIGIN=http://localhost:3000` - Frontend URL
- `GITHUB_CLIENT_ID=your_client_id` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET=your_client_secret` - GitHub OAuth App Client Secret
- `GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback` - OAuth callback
- `AUTH_SUCCESS_REDIRECT=http://localhost:3000` - Redirect after login

## GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4000/auth/github/callback`
3. Copy Client ID and Client Secret to `.env` file

## API Routes

- `GET /` - Server info
- `GET /health` - Health check
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

## Scripts

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

## Troubleshooting

- **MongoDB connection failed**: Make sure MongoDB is running
- **GitHub OAuth not configured**: Set up GitHub OAuth App and update `.env`
- **Port already in use**: Change `PORT` in `.env` file


