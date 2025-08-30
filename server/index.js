/**
 * Minimal demo proxy server for GitHub API.
 * - POST /api/session { token }  -> { sessionId }
 * - GET  /api/repos/:owner/:repo ...
 *
 * NOTE: This server stores tokens in memory for a short TTL (demo only).
 * For production use a secure store and proper auth.
 */
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// in-memory store (demo only)
const SESSIONS = new Map();
const TTL_MS = 1000 * 60 * 5; // 5 minutes

app.post('/api/session', (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  const id = uuidv4();
  SESSIONS.set(id, token);
  setTimeout(() => SESSIONS.delete(id), TTL_MS);
  res.json({ sessionId: id, ttl: TTL_MS });
});

// Proxy helper
async function proxyRequest(req, res, path) {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const token = sessionId ? SESSIONS.get(sessionId) : req.headers['x-client-token'];
  if (!token) return res.status(401).json({ error: 'Missing session or token' });

  const url = `https://api.github.com${path}${req.url.includes('?') ? '' : ''}`;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`,
    'User-Agent': 'GetCommits-Proxy'
  };
  try {
    const ghRes = await fetch(`https://api.github.com${req.path.replace(/^\/api/, '')}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`, {
      method: req.method,
      headers
    });
    const text = await ghRes.text();
    res.status(ghRes.status).set({
      'X-RateLimit-Limit': ghRes.headers.get('X-RateLimit-Limit') || '',
      'X-RateLimit-Remaining': ghRes.headers.get('X-RateLimit-Remaining') || '',
      'X-RateLimit-Reset': ghRes.headers.get('X-RateLimit-Reset') || ''
    }).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

// Routes to proxy common endpoints used by the client
app.get('/api/repos/:owner/:repo', (req, res) => proxyRequest(req, res));
app.get('/api/repos/:owner/:repo/branches', (req, res) => proxyRequest(req, res));
app.get('/api/repos/:owner/:repo/commits', (req, res) => proxyRequest(req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`GetCommits proxy server listening on ${port}`);
});