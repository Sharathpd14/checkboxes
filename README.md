# Checkbox App

A real-time collaborative checkbox grid application with custom OIDC-style authentication, WebSocket support, rate limiting, and distributed state management using Redis and MongoDB.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features Implemented](#features-implemented)
- [Architecture Overview](#architecture-overview)
- [How to Run Locally](#how-to-run-locally)
- [Environment Variables Required](#environment-variables-required)
- [Redis Setup Instructions](#redis-setup-instructions)
- [Authentication Flow Explanation](#authentication-flow-explanation)
- [WebSocket Flow Explanation](#websocket-flow-explanation)
- [Rate Limiting Logic Explanation](#rate-limiting-logic-explanation)
- [Database Models](#database-models)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)

## 🎯 Project Overview

The Checkbox Auth App is a full-stack collaborative application that allows authenticated users to toggle checkboxes in a real-time grid. The application implements a custom OIDC-compliant authentication flow with the following flow:

1. **Login/Registration** - Users create accounts or log in
2. **Authorization** - OIDC authorization code flow with authorization codes and tokens
3. **Grid Access** - Authenticated users access the main checkbox grid
4. **Real-time Updates** - Multiple users see checkbox state changes instantly via WebSocket
5. **Distributed State** - Checkbox states persisted in Redis with MongoDB for user data

The app emphasizes security, scalability, and real-time collaboration with built-in rate limiting to prevent abuse.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+ (ES modules)
- **Framework**: Express.js - HTTP server and routing
- **Real-time Communication**: Socket.IO 4.8.1 - WebSocket support for real-time updates
- **Database**: 
  - MongoDB Atlas - User profiles and auth codes
  - Upstash Redis - Session store, bitset grid state, and pub/sub
- **Security**:
  - bcryptjs - Password hashing
  - jsonwebtoken - JWT token generation
  - helmet - HTTP headers security
  - cors - Cross-Origin Resource Sharing
  - cookie-parser - Secure cookie handling
- **Session Management**: express-session with MongoDB store
- **Development**: nodemon for auto-reload

### Frontend
- **HTML5** with embedded CSS and vanilla JavaScript
- **Socket.IO Client** 4.8.1 - Real-time WebSocket connection
- **Styling**: Custom CSS with glassmorphism design
- **Pages**:
  - `/login` - Login page with form
  - `/register` - User registration page
  - `/app` - Main checkbox grid page (authenticated only)

### Deployment & Containers
- **Docker** - Multi-stage containerization with Node.js 20-alpine base image

## ✨ Features Implemented

### Authentication & Authorization
- ✅ **Custom OIDC-style Flow** - Authorization code grant with code exchange
- ✅ **User Registration** - Sign up with name, email, and password
- ✅ **Secure Login** - Password verification with bcryptjs
- ✅ **Session Management** - Server-side sessions with MongoDB store
- ✅ **JWT Tokens** - Access tokens and ID tokens with HS256 signing
- ✅ **OIDC Metadata Endpoint** - Standards-compliant `.well-known/openid-configuration`
- ✅ **User Context** - OIDC Subject (sub) claim for unique user identification

### User Interface
- ✅ **Multi-page Navigation**:
  - Login page (default)
  - Separate registration page with link back to login
  - Main app page (authenticated only)
- ✅ **Responsive Grid UI** - Full-page checkbox grid fitting the viewport
- ✅ **Header with User Info** - Displays logged-in user name
- ✅ **Logout Functionality** - Secure session termination
- ✅ **Glassmorphism Design** - Modern UI with blur effects and gradients

### Checkbox Grid & Real-time Collaboration
- ✅ **Large-scale Bitset State** - Up to 1,000,000 total bits in Redis
- ✅ **Visible Grid** - Configurable visible cells (default 600)
- ✅ **Real-time Toggle** - Instant checkbox updates via WebSocket
- ✅ **Distributed Updates** - Redis pub/sub broadcasts changes to all clients
- ✅ **Atomic Operations** - Redis transactions for consistent state
- ✅ **Version Tracking** - Grid version increments on each change

### Security & Rate Limiting
- ✅ **HTTP Rate Limiting** - 150 requests/60 seconds per user
- ✅ **WebSocket Event Rate Limiting** - 120 events/60 seconds per user
- ✅ **Toggle-specific Rate Limiting** - 50 toggles/60 seconds per user
- ✅ **User-based Limiting** - Per-user tracking via OIDC sub claim
- ✅ **Configurable Windows** - Rate limit window is customizable
- ✅ **Helmet Security** - HTTP security headers
- ✅ **CORS Protection** - Origin validation

### API Endpoints
- ✅ **Health Check** - `GET /health`
- ✅ **OIDC Endpoints** - Register, Login, Authorize, Token Exchange
- ✅ **Auth Callbacks** - Authorization code handling
- ✅ **Grid API** - Visible grid state retrieval with rate limiting
- ✅ **Session Info** - Current user authentication status

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
│                    (HTML5 + Socket.IO)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Server                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentication Layer                    │   │
│  │  - OIDC Authorization Code Flow                      │   │
│  │  - JWT Token Generation (HS256)                      │   │
│  │  - Session Management (Express-Session)             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Real-time Layer (Socket.IO)              │   │
│  │  - WebSocket Connections                            │   │
│  │  - Rate Limiting Middleware                         │   │
│  │  - Checkbox Toggle Events                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              HTTP API Layer                          │   │
│  │  - OIDC Endpoints                                    │   │
│  │  - Grid State API                                    │   │
│  │  - User Info Endpoints                              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────┬────────────────────┘
             │                          │
             │ MongoDB                  │ Redis
             ▼                          ▼
    ┌────────────────┐      ┌──────────────────────┐
    │ MongoDB Atlas  │      │  Upstash Redis       │
    ├────────────────┤      ├──────────────────────┤
    │ Users          │      │ Session Store        │
    │ AuthCodes      │      │ Checkbox Bitset      │
    │ Timestamps     │      │ Grid Version         │
    │                │      │ Rate Limit Counters  │
    │                │      │ Pub/Sub Topics       │
    └────────────────┘      └──────────────────────┘
```

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** 20+ (with npm)
- **MongoDB** account and connection URI (e.g., MongoDB Atlas)
- **Redis** instance (Upstash recommended for cloud, or local Redis)
- **Git** (to clone if needed)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd final-checkbox-auth-app

# Install root and workspace dependencies
npm run install:all
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
# Copy the template (if it exists)
cp .env.example .env

# Or create manually (see Environment Variables section below)
```

### Step 3: Start Development Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run start
```

The server will start on `http://localhost:4000` (or your configured `APP_BASE_URL`).

### Step 4: Access the Application

1. Open `http://localhost:4000` in your browser
2. You'll be redirected to `/login`
3. Click "Register" to create a new account
4. Log in with your credentials
5. Access the checkbox grid at `/app`

### Running with Docker

```bash
# Build the Docker image
docker build -t checkbox-app .

# Run the container
docker run -p 4000:4000 --env-file .env checkbox-app
```

## 🔐 Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
APP_BASE_URL=http://localhost:4000
TRUST_PROXY=1

# Security & Sessions
SESSION_SECRET=your-secure-random-secret-32-chars-minimum
JWT_SIGNING_SECRET=your-jwt-signing-secret-32-chars-minimum

# Database Connections
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
REDIS_URL=redis://:<password>@<host>:<port>

# Grid Configuration
GRID_TOTAL_BITS=1000000
VISIBLE_GRID_CELLS=600

# Rate Limiting (requests/second)
HTTP_RATE_LIMIT=150
WS_RATE_LIMIT=120
TOGGLE_RATE_LIMIT=50
RATE_LIMIT_WINDOW_SECONDS=60

# OIDC Configuration
CLIENT_ID=realtime-checkbox-client
CLIENT_REDIRECT_URI=http://localhost:4000/api/auth/callback
```

### Environment Variable Explanations

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | 4000 | Server port |
| `NODE_ENV` | string | development | Environment (development/production) |
| `APP_BASE_URL` | string | http://localhost:4000 | Application URL (used in OIDC flows) |
| `SESSION_SECRET` | string | *required* | Secret for signing session cookies (min 32 chars) |
| `JWT_SIGNING_SECRET` | string | *required* | Secret for signing JWT tokens (min 32 chars) |
| `MONGODB_URI` | string | *required* | MongoDB connection string |
| `REDIS_URL` | string | *required* | Redis connection URL |
| `GRID_TOTAL_BITS` | number | 1000000 | Total bits in the checkbox bitset |
| `VISIBLE_GRID_CELLS` | number | 600 | Number of visible checkboxes (600 = 20x30 grid) |
| `HTTP_RATE_LIMIT` | number | 150 | Max HTTP requests per window per user |
| `WS_RATE_LIMIT` | number | 120 | Max WebSocket events per window per user |
| `TOGGLE_RATE_LIMIT` | number | 50 | Max checkbox toggles per window per user |
| `RATE_LIMIT_WINDOW_SECONDS` | number | 60 | Rate limit time window in seconds |
| `TRUST_PROXY` | number | 1 | Enable proxy trust for IP extraction |
| `CLIENT_ID` | string | realtime-checkbox-client | OIDC client identifier |
| `CLIENT_REDIRECT_URI` | string | http://localhost:4000/api/auth/callback | OAuth redirect URI |

## 🔴 Redis Setup Instructions

### Option 1: Upstash Redis (Recommended for Cloud)

1. **Create Upstash Account**:
   - Go to [upstash.com](https://upstash.com)
   - Sign up or log in
   - Create a new project

2. **Create Redis Database**:
   - Click "Create Database"
   - Select region (choose closest to your app)
   - Choose "Upstash" type
   - Wait for database to initialize

3. **Get Connection Details**:
   - Copy the **Redis URL** (format: `redis://:password@host:port`)
   - Add to `.env` as `REDIS_URL=<your-redis-url>`

4. **Verify Connection**:
   ```bash
   npm run dev
   # Check logs for "[redis] connected" message
   ```

### Option 2: Local Redis (Development)

```bash
# On macOS with Homebrew
brew install redis
brew services start redis

# On Linux (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis-server

# On Windows, download from https://github.com/microsoftarchive/redis/releases
# Or use WSL with Linux instructions above

# Verify Redis is running
redis-cli ping
# Should return: PONG

# Set .env variable
REDIS_URL=redis://127.0.0.1:6379
```

### Option 3: Docker Redis

```bash
# Run Redis in Docker
docker run -d --name redis-app -p 6379:6379 redis:7-alpine

# Connection string
REDIS_URL=redis://127.0.0.1:6379
```

## 🔑 Authentication Flow Explanation

The application implements a **custom OIDC-compliant Authorization Code flow** with the following stages:

### Flow Diagram

```
User                           Frontend                    Backend (Express)                 MongoDB
 │                                │                                │                             │
 ├─ Clicks "Login" ─────────────► │                                │                             │
 │                                │                                │                             │
 │                         ┌──────────────────┐                    │                             │
 │                         │ Redirect to      │                    │                             │
 │                         │ /login page      │                    │                             │
 │                         └──────────────────┘                    │                             │
 │                                │                                │                             │
 │                     Fills login form                            │                             │
 │                                │                                │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ POST /oidc/login              │               │                             │
 │                │ {email, password}             │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                        │─ Validate password ────────────────► │ findOne({email}) ────────► │
 │                        │                                        │                             │
 │                        │◄─ User document ─────────────────────│◄───────────────────────────│
 │                        │                                        │                             │
 │                        │  bcryptjs.compare(pwd, hash)          │                             │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Save localUserId to session   │               │                             │
 │                │ {sub, name, email, id}        │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                        │◄─ Response {ok: true, user} ─────────│                             │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Generate auth params:         │               │                             │
 │                │ - client_id                   │               │                             │
 │                │ - state (random)              │               │                             │
 │                │ - nonce (random)              │               │                             │
 │                │ - scope: openid profile email │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Redirect to:                  │               │                             │
 │                │ /oidc/authorize               │               │                             │
 │                │ ?client_id=...&state=...      │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                        │─ GET /oidc/authorize ─────────────► │                             │
 │                        │                                        │                             │
 │                        │  Validate client_id & redirect_uri    │                             │
 │                        │  Create AuthCode object               │                             │
 │                        │  Store in MongoDB                     │─ Create AuthCode ───────► │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Redirect to callback:         │               │                             │
 │                │ /api/auth/callback            │               │                             │
 │                │ ?code=xxxxx&state=xxxxx       │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                        │─ GET /api/auth/callback ───────────► │                             │
 │                        │   Extract code from query params      │                             │
 │                        │                                        │                             │
 │                        │  POST /oidc/token                     │                             │
 │                        │  {grant_type, code, client_id}        │                             │
 │                        │                                        │                             │
 │                        │  Validate code in MongoDB             │─ findOne({code}) ────────► │
 │                        │  Check expiry (5 min)                 │                             │
 │                        │  Extract user details                 │                             │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Generate tokens:              │               │                             │
 │                │ - Access Token (JWT HS256)    │               │                             │
 │                │ - ID Token (JWT HS256)        │               │                             │
 │                │ - Both sign with JWT_SECRET   │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                        │  Delete AuthCode from MongoDB         │─ deleteOne({_id}) ───────► │
 │                        │                                        │                             │
 │                        │◄─ Response:                           │                             │
 │                        │   {access_token, id_token,            │                             │
 │                        │    user: {sub, name, email}}          │                             │
 │                        │                                        │                             │
 │                ┌───────────────────────────────┐                │                             │
 │                │ Save tokens & user to session │               │                             │
 │                │ Redirect to /app              │               │                             │
 │                └───────┬───────────────────────┘                │                             │
 │                        │                                        │                             │
 │                 ✅ Authenticated!                              │                             │
```

### Key OIDC Concepts Implemented

1. **Authorization Code Grant Type**
   - Client-side never sees tokens directly
   - Tokens only issued to backend via secure channel
   - Authorization code is single-use and expires in 5 minutes

2. **State Parameter**
   - Prevents CSRF attacks
   - Randomly generated for each authorization request
   - Returned in callback for validation

3. **Nonce Parameter**
   - Used in ID token to prevent replay attacks
   - Randomly generated with each request
   - Could be verified in ID token (current implementation stores it)

4. **Scope Support**
   - `openid` - Requests ID token
   - `profile` - Requests user profile (name, etc.)
   - `email` - Requests email address

5. **Token Types**
   - **Access Token**: Used to access protected resources (JWT)
   - **ID Token**: Contains user identity information (JWT with user claims)
   - Both signed with `JWT_SIGNING_SECRET` using HS256 algorithm

### Session Management

- Session ID stored in HTTP-only cookie (secure by default in production)
- Session data persisted to MongoDB via `connect-mongo`
- User object available on `req.session.user` in all routes
- Session automatically destroyed on logout

### Related Code Files

- [authRoutes.js](backend/src/routes/authRoutes.js) - Login callback and auth endpoints
- [oidcRoutes.js](backend/src/routes/oidcRoutes.js) - OIDC authorize, token, and metadata
- [customOidc.js](backend/src/auth/customOidc.js) - Authorization code and token logic
- [session.js](backend/src/services/session.js) - Session middleware setup

## 🌐 WebSocket Flow Explanation

The application uses **Socket.IO** for real-time, bidirectional communication between clients and server, with **Redis pub/sub** for multi-instance broadcasting.

### WebSocket Architecture

```
Client 1                     Client 2                    Client 3
   │                            │                           │
   │ WebSocket Connection        │ WebSocket Connection      │ WebSocket Connection
   └────────────┬────────────────┴───────────────┬───────────┘
                │                                 │
                │        Socket.IO Server        │
                │    ┌────────────────────┐     │
                │    │  Connection Pool   │     │
                │    │  - User Auth Check │     │
                │    │  - Session Restore │     │
                │    │  - Rate Limiting   │     │
                │    └────────────────────┘     │
                │                                 │
            Emits: checkbox:toggle                │
                │                                 │
                ├──► Process & Validate           │
                │    - Rate limit check           │
                │    - Index validation           │
                │                                 │
                ├──► Update Grid State            │
                │    (Redis bitset)               │
                │                                 │
                └──► Publish Update               │
                     Redis pub/sub:                │
                     CHANNELS.checkboxUpdated      │
                     │                             │
                     ├─────────────────────────────┴──────────────┐
                     │                                            │
                     ▼                                            ▼
              All subscribed                             All subscribed
              instances receive                          instances receive
                     │                                            │
                     ├─ Instance A                                │
                     │  io.emit('checkbox:updated',               │
                     │           {index, checked, ...})           │
                     │  │                                         │
                     │  └──► Client 1 receives update             │
                     │  └──► Client 2 receives update             │
                     │                                            │
                     ├─ Instance B                                │
                     │  io.emit('checkbox:updated',               │
                     │           {index, checked, ...})           │
                     │  │                                         │
                     │  └──► Client 3 receives update             │
```

### Connection Flow

```javascript
// CLIENT SIDE
const socket = io();

// Event: Server sends current user
socket.on('session:user', (user) => {
  console.log('Connected as:', user.name);
});

// Event: Checkbox was updated (by any user, including self)
socket.on('checkbox:updated', (update) => {
  console.log(`Checkbox ${update.index} is now ${update.checked}`);
  updateUI(update);
});

// Action: Toggle a checkbox
socket.emit('checkbox:toggle', {index: 42}, (response) => {
  if (response.ok) {
    console.log('Toggle successful');
  } else {
    console.log('Error:', response.error);
  }
});
```

### Server-side Handler Breakdown

```javascript
io.on('connection', (socket) => {
  // Step 1: Send current user to client
  socket.emit('session:user', socket.user);
  
  // Step 2: Listen for toggle events
  socket.on('checkbox:toggle', async ({index}, callback) => {
    try {
      // Step 2a: Rate limit check (2 separate limits)
      await checkSocketRateLimit(socket, 'ws-events', env.wsRateLimit);     // General events
      await checkSocketRateLimit(socket, 'ws-toggle', env.toggleRateLimit); // Specific toggles
      
      // Step 2b: Validate index
      const parsed = Number(index);
      if (Number.isNaN(parsed) || parsed < 0 || parsed >= env.visibleGridCells) {
        throw new Error('Invalid checkbox index');
      }
      
      // Step 2c: Update grid in Redis
      const update = await toggleCheckbox(parsed);
      
      // Step 2d: Create payload with metadata
      const payload = {
        ...update,                              // {index, checked}
        updatedBy: socket.user.sub,            // User identifier
        at: Date.now()                         // Timestamp
      };
      
      // Step 2e: Broadcast to all clients via Redis pub/sub
      await redisPub.publish(
        CHANNELS.checkboxUpdated,
        JSON.stringify(payload)
      );
      
      // Step 2f: Send confirmation to requesting client
      callback?.({ok: true, ...payload});
      
    } catch (error) {
      // Send error to requesting client
      callback?.({
        ok: false,
        error: error.message,
        ...(error.data || {})  // Might include retryAfter
      });
    }
  });
});

// Pub/Sub Subscription (runs on every Socket.IO server instance)
await redisSub.subscribe(CHANNELS.checkboxUpdated, (message) => {
  // Broadcast to ALL connected clients on this instance
  io.emit('checkbox:updated', JSON.parse(message));
});
```

### Key Features

1. **Multi-instance Scalability**
   - Redis pub/sub ensures all server instances receive updates
   - Every instance broadcasts to its connected clients
   - No sticky sessions required

2. **Real-time Updates**
   - Changes instantly propagate to all clients
   - Metadata includes who made the change and when
   - Clients can display "updated by: John" information

3. **Error Handling**
   - Rate limit errors include `retryAfter` (TTL in seconds)
   - Invalid indices return descriptive errors
   - Connection drops handled by Socket.IO reconnection

4. **Authentication**
   - Session middleware validates user on connection
   - Unauthenticated connections rejected
   - User context available throughout socket lifecycle

### Related Code Files

- [sockets/index.js](backend/src/sockets/index.js) - Socket.IO connection and event handlers
- [gridState.js](backend/src/services/gridState.js) - Toggle logic and Redis operations
- [pubsub.js](backend/src/utils/pubsub.js) - Pub/sub channel constants

## 🚦 Rate Limiting Logic Explanation

The application implements **three-tier rate limiting** using Redis atomic operations to prevent abuse while allowing legitimate usage patterns.

### Rate Limiting Tiers

```
┌────────────────────────────────────────────────────────────┐
│  TIER 1: HTTP Request Limiting (150/60s)                   │
│  ├─ Applies to: All HTTP endpoints                         │
│  ├─ Key Identifier: User OIDC sub claim (req.session.user) │
│  ├─ Fallback: Client IP if not authenticated               │
│  └─ Middleware: httpRateLimit('http')                      │
├────────────────────────────────────────────────────────────┤
│  TIER 2: WebSocket Event Limiting (120/60s)               │
│  ├─ Applies to: All WebSocket events                       │
│  ├─ Key Identifier: User sub or socket ID                  │
│  ├─ Purpose: Prevent connection spam                       │
│  └─ Check: checkSocketRateLimit(socket, 'ws-events', 120)  │
├────────────────────────────────────────────────────────────┤
│  TIER 3: Checkbox Toggle Limiting (50/60s)                │
│  ├─ Applies to: Checkbox toggle operations only            │
│  ├─ Key Identifier: User sub or socket ID                  │
│  ├─ Purpose: Prevent rapid-fire toggling                   │
│  └─ Check: checkSocketRateLimit(socket, 'ws-toggle', 50)   │
└────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. Redis Counter Key Strategy

```javascript
// Key format
const key = `ratelimit:{prefix}:{identifier}`;

// Examples
ratelimit:http:user-12345
ratelimit:ws-events:user-12345
ratelimit:ws-toggle:user-12345
ratelimit:grid-api:192.168.1.1

// Per-user isolation prevents one user from blocking others
```

#### 2. Counter Operation Flow

```javascript
async function consume({prefix, identifier, limit}) {
  const key = `ratelimit:${prefix}:${identifier}`;
  
  // STEP 1: Increment counter atomically
  const count = await redis.incr(key);
  
  // STEP 2: Set expiry only on first increment (creation)
  // This ensures the key expires after the window passes
  if (count === 1) {
    await redis.expire(key, env.rateLimitWindowSeconds);
  }
  
  // STEP 3: Get remaining TTL for retry-after header
  const retryAfter = await redis.ttl(key);
  
  // STEP 4: Return result
  return {
    allowed: count <= limit,                    // true if within limit
    remaining: Math.max(0, limit - count),      // requests left
    retryAfter                                  // seconds until reset
  };
}
```

#### 3. HTTP Rate Limiting

```javascript
export function httpRateLimit(prefix = 'http') {
  return async (req, res, next) => {
    try {
      const id = req.session?.user?.sub || req.ip;
      const result = await consume({
        prefix,
        identifier: id,
        limit: env.httpRateLimit
      });
      
      // Set response headers (like GitHub API)
      res.setHeader('X-RateLimit-Limit', String(env.httpRateLimit));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      
      // Reject if over limit
      if (!result.allowed) {
        return next(createError(429, 'Too many requests'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

Usage in routes:
```javascript
gridRouter.use(httpRateLimit('grid-api'));
// All routes under gridRouter are now rate limited
```

#### 4. WebSocket Rate Limiting

```javascript
export async function checkSocketRateLimit(socket, prefix, limit) {
  const id = socket.user?.sub || socket.handshake.address || socket.id;
  const result = await consume({prefix, identifier: id, limit});
  
  if (!result.allowed) {
    const error = new Error('Rate limit exceeded');
    error.data = {retryAfter: result.retryAfter};
    throw error;
  }
}
```

Usage in socket handlers:
```javascript
socket.on('checkbox:toggle', async ({index}, callback) => {
  try {
    // Two separate rate limit checks
    await checkSocketRateLimit(socket, 'ws-events', env.wsRateLimit);     // 120/min
    await checkSocketRateLimit(socket, 'ws-toggle', env.toggleRateLimit); // 50/min
    
    // ... toggle logic ...
  } catch (error) {
    callback?.({ok: false, error: error.message, ...(error.data || {})});
  }
});
```

### Rate Limiting Decision Tree

```
Request arrives
    │
    ├─ Is it HTTP?
    │  └─ Yes → Check httpRateLimit
    │
    └─ Is it WebSocket?
       └─ Yes → Is it a toggle event?
          ├─ Yes → Check BOTH ws-events AND ws-toggle
          └─ No  → Check ONLY ws-events
               │
               ├─ Rate limit exceeded
               │  └─ Return 429 (HTTP) or callback error
               │
               └─ Within limit
                  └─ Process request normally
```

### Configuration Examples

```env
# Scenario 1: Strict security (fewer requests)
HTTP_RATE_LIMIT=50
WS_RATE_LIMIT=30
TOGGLE_RATE_LIMIT=10
RATE_LIMIT_WINDOW_SECONDS=60

# Scenario 2: Balanced (default)
HTTP_RATE_LIMIT=150
WS_RATE_LIMIT=120
TOGGLE_RATE_LIMIT=50
RATE_LIMIT_WINDOW_SECONDS=60

# Scenario 3: Lenient (development/testing)
HTTP_RATE_LIMIT=1000
WS_RATE_LIMIT=500
TOGGLE_RATE_LIMIT=200
RATE_LIMIT_WINDOW_SECONDS=60

# Scenario 4: Longer window (fewer resets)
HTTP_RATE_LIMIT=300
WS_RATE_LIMIT=240
TOGGLE_RATE_LIMIT=100
RATE_LIMIT_WINDOW_SECONDS=300  # 5 minutes
```

### Monitoring Rate Limits

To check rate limit status in Redis:

```bash
# Connect to Redis CLI
redis-cli

# View all rate limit keys for a user
KEYS "ratelimit:*:user-12345"

# Get current count for a specific limit
GET "ratelimit:ws-toggle:user-12345"

# See TTL (time until reset)
TTL "ratelimit:ws-toggle:user-12345"
```

### Related Code Files

- [rateLimiter.js](backend/src/services/rateLimiter.js) - Rate limiting logic
- [sockets/index.js](backend/src/sockets/index.js#L19-L24) - WebSocket rate limit checks
- [gridRoutes.js](backend/src/routes/gridRoutes.js#L4) - HTTP rate limit middleware

## 📊 Database Models

### User Model

```javascript
// Collection: users
{
  _id: ObjectId,
  name: String,              // Display name
  email: String,            // Unique email (indexed)
  passwordHash: String,     // bcrypt hash
  oidcSub: String,          // Unique OIDC subject (indexed)
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

**File**: [backend/src/models/User.js](backend/src/models/User.js)

### AuthCode Model

```javascript
// Collection: authcodes
{
  _id: ObjectId,
  code: String,             // Random hex, single-use
  userId: ObjectId,         // Reference to User
  clientId: String,         // OIDC client ID
  redirectUri: String,      // OAuth redirect URL
  scope: String,            // Space-separated scopes
  nonce: String,            // Prevents replay attacks
  expiresAt: Date,          // Auto-deleted after this
  createdAt: Date
}
```

**File**: [backend/src/models/AuthCode.js](backend/src/models/AuthCode.js)

**Notes**:
- Authorization codes expire after 5 minutes
- Single-use: deleted after token exchange
- Ensures CSRF protection via state parameter
- Nonce prevents token replay attacks

### Redis Data Structures

```javascript
// Checkbox Grid - Bitset (can store millions of bits efficiently)
// Key: grid:bitset
// Type: Bitmap (Redis native)
// Size: ~1,000,000 bits = ~125 KB
SET grid:bitset 42 1    // Set bit 42 to 1
GET grid:bitset 42      // Get bit 42
// Stores checkbox state: 0 = unchecked, 1 = checked

// Grid Version - Increment counter
// Key: grid:version
// Type: String (integer)
// Increments on every checkbox change
SET grid:version 1

// Session Data (via connect-redis when used)
// Key: session:<session-id>
// Type: Hash
// Stores: {user, tokens, other session data}

// Rate Limit Counters
// Key: ratelimit:{prefix}:{identifier}
// Type: String (integer)
// Example: ratelimit:ws-toggle:user-12345 = 42
```

## 📁 Project Structure

```
final-checkbox-auth-app/
├── Dockerfile                     # Docker configuration (Node 20-alpine)
├── package.json                   # Root workspace config
├── README.md                      # This file
├── .env                          # Environment variables (create this)
│
├── backend/                       # Express.js backend
│   ├── package.json              # Backend dependencies
│   ├── src/
│   │   ├── app.js               # Express app factory
│   │   ├── server.js            # Bootstrap and server startup
│   │
│   │   ├── config/
│   │   │   ├── db.js            # MongoDB connection
│   │   │   ├── env.js           # Environment variables
│   │   │   └── redis.js         # Redis client setup
│   │   │
│   │   ├── auth/
│   │   │   └── customOidc.js    # OIDC logic (register, verify, exchange)
│   │   │
│   │   ├── models/
│   │   │   ├── User.js          # User schema
│   │   │   └── AuthCode.js      # Authorization code schema
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # Login callback, /me, logout
│   │   │   ├── gridRoutes.js    # GET /api/grid/visible
│   │   │   ├── oidcRoutes.js    # OIDC endpoints (register, token, etc.)
│   │   │   └── pageRoutes.js    # Static page serving
│   │   │
│   │   ├── services/
│   │   │   ├── gridState.js     # Redis bitset operations
│   │   │   ├── jwt.js           # JWT signing
│   │   │   ├── rateLimiter.js   # Rate limiting logic
│   │   │   └── session.js       # Session middleware
│   │   │
│   │   ├── sockets/
│   │   │   └── index.js         # Socket.IO server setup
│   │   │
│   │   ├── middleware/          # (Custom middleware if needed)
│   │   │
│   │   └── utils/
│   │       └── pubsub.js        # Redis pub/sub constants
│   │
│   └── node_modules/            # Backend dependencies
│
└── frontend/                      # Static frontend files
    └── public/
        ├── app.html            # Main checkbox grid page
        ├── login.html          # Login form page
        ├── register.html       # Registration form page
        └── styles.css          # Global styles
```

## 🔌 API Routes

### Authentication Routes

| Method | Route | Authentication | Description |
|--------|-------|----------------|-------------|
| `GET` | `/api/auth/login` | No | Redirect to OIDC authorize |
| `GET` | `/api/auth/callback?code=...` | No | OAuth callback handler |
| `GET` | `/api/auth/me` | No | Get current user info |
| `POST` | `/api/auth/logout` | No | Destroy session |

### OIDC Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/oidc/.well-known/openid-configuration` | OIDC metadata |
| `POST` | `/oidc/register` | User registration |
| `POST` | `/oidc/login` | User login |
| `GET` | `/oidc/authorize` | Authorization code issuance |
| `POST` | `/oidc/token` | Token exchange |
| `GET` | `/oidc/userinfo` | Get authenticated user info |

### Grid API Routes

| Method | Route | Rate Limit | Description |
|--------|-------|-----------|-------------|
| `GET` | `/api/grid/visible` | Yes (150/min) | Get visible grid state |

### WebSocket Events

| Direction | Event | Payload | Description |
|-----------|-------|---------|-------------|
| Server → Client | `session:user` | `{id, sub, name, email}` | Send current user on connection |
| Server → Client | `checkbox:updated` | `{index, checked, updatedBy, at}` | Broadcast checkbox change |
| Client → Server | `checkbox:toggle` | `{index}` | Request checkbox toggle |

### Static Routes

| Route | File |
|-------|------|
| `/` | `frontend/public/login.html` |
| `/login` | `frontend/public/login.html` |
| `/register` | `frontend/public/register.html` |
| `/app` | `frontend/public/app.html` |

### System Routes

| Route | Response |
|-------|----------|
| `GET /health` | `{ok: true}` |

## 📈 Performance Considerations

- **Checkbox Bitset**: Uses Redis bitmap for O(1) bit access and 1 MB per 8 million bits
- **Session Store**: MongoDB session persistence with indexing for fast lookups
- **Rate Limiting**: Redis atomic operations ensure O(1) limit checks
- **WebSocket Pub/Sub**: Redis pub/sub scales horizontally across server instances
- **Compression**: gzip compression on all responses via `compression` middleware

## 🔒 Security Features

- **Password Hashing**: bcryptjs with cost factor 10
- **JWT Signing**: HS256 with environment secret
- **CORS Protection**: Origin validation from `APP_BASE_URL`
- **Helmet**: HTTP security headers (CSP disabled for Socket.IO)
- **Cookie Security**: HTTP-only cookies with secure flags in production
- **Rate Limiting**: Multi-tier protection against abuse
- **Input Validation**: Index and parameter validation
- **Session Management**: Server-side sessions with secure storage

## 📝 License

Cohort Final Project - 2026

---

**For questions or issues**, check the code comments in the respective files or create an issue in the repository.
