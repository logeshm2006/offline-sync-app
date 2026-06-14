# Grievance Backend

Simple Node.js + Express backend for the Grievance Redressal System.

## Setup

1. Copy `.env.example` to `.env` and update `MONGODB_URI`.

2. Install dependencies and run:

```bash
cd server
npm install
npm run dev   # for development (nodemon)
# or
npm start     # production
```

Alternatively you can run the built entry directly with:

```bash
cd server
node index.js
```

Make sure `server/index.js` is the main entry file (package.json `main` points to `index.js`).

### Deploying to Render / Railway

- Set the **Root Directory** to `server`.
- Build command: `npm install`
- Start command: `node index.js`
- Set environment variables: `MONGO_URI` (required), optionally `PORT`.

The server listens on `process.env.PORT || 10000` and binds to `0.0.0.0` for cloud hosts.

## API

POST /api/grievances
- Accepts JSON: `{ name, village, category, description, priority, timestamp }`
- Returns saved grievance document.

GET /api/health
- Returns `{ ok: true }`.

## Notes
- Uses Mongoose for schema validation.
- Enable CORS for requests from the frontend.
- Use a proper connection string for production MongoDB (Atlas or self-hosted).
