# Deployment Guide

## Build & Start
- `npm run serve:prod` builds Next.js and bundles the server, then starts in production mode.

## Environment
- Use `.env.local` for secrets (gitignored).
- For production, set `NODE_ENV=production` and provide `.env.production` or environment variables.

## Firebase Rules
- Edit `firestore.rules` and deploy with `npm run firebase:rules:deploy` (requires Firebase CLI and project configuration).

