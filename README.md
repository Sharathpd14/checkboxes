# Final Checkbox Auth App

This version follows the requested flow exactly:
- Login page first
- Separate register page
- Back to login link after registration
- Main checkbox page only after login
- Header with user name and logout button
- Page-fitting checkbox grid with no scrollable side panel

## Stack
- Node.js
- Express
- Socket.IO
- MongoDB Atlas
- Upstash Redis
- Custom OIDC-style auth flow

## Run locally
```bash
cp .env.example .env
npm run install:all
npm run dev
```

The backend now reads the root `.env` automatically.

## Pages
- `/login`
- `/register`
- `/app`
