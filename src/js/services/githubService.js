import { getToken } from '../auth/tokenManager.js';

// Small helper to map errors
function makeError(status, message, details = {}) {
  return Object.assign(new Error(message), { status, details });
}

function getBaseUrl(proxyBase) {
  // If proxyBase provided, use proxy for all GitHub calls.
  // Proxy should accept the same path shape as used below.
  return proxyBase ? proxyBase.replace(/\/$/, '') : 'https://api.github.com';
}

async function request(url, options = {}, proxyBase = '') {
  const base = getBaseUrl(proxyBase);
  const token = getToken();

  const headers = Object.assign(
    { Accept: 'application/vnd.github.v3+json' },
    options.headers || {}
  );

  if (token && !proxyBase) {
    headers.Authorization = `token ${token}`;
  }

  // If using proxyBase, send token to proxy via X-Client-Token header (demo).
  if (token && proxyBase) {
    headers['X-Client-Token'] = token;
  }

  const res = await fetch(base + url, { ...options, headers });

  const rateInfo = {
    limit: res.headers.get('X-RateLimit-Limit'),
    remaining: res.headers.get('X-RateLimit-Remaining'),
    reset: res.headers.get('X-RateLimit-Reset')
  };

  if (res.ok) {
    const contentType = res.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { data, rateInfo, headers: res.headers };
    }
    const text = await res.text();
    return { data: text, rateInfo, headers: res.headers };
  }

  // handle common statuses
  if (res.status === 401) throw makeError(401, 'Unauthorized — invalid token or credentials', { rateInfo });
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const isRateLimit = res.headers.get('X-RateLimit-Remaining') === '0' || (body && body.message && body.message.includes('rate limit'));
    if (isRateLimit) throw makeError(403, 'Rate limit exceeded', { rateInfo });
    throw makeError(403, 'Forbidden — access denied', { rateInfo });
  }
  if (res.status === 404) throw makeError(404, 'Not found — repo or branch does not exist', { rateInfo });
  if (res.status === 409) throw makeError(409, 'Empty repository (no commits)', { rateInfo });

  // fallback
  const text = await res.text().catch(() => '');
  throw makeError(res.status, `GitHub API error: ${res.status}`, { body: text, rateInfo });
}

export async function getRepo(owner, repo, proxyBase = '') {
  if (!owner || !repo) throw new Error('owner and repo required');
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {}, proxyBase);
}

export async function listBranches(owner, repo, proxyBase = '') {
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`, {}, proxyBase);
}

export async function listCommits(owner, repo, branch = null, per_page = 30, page = 1, proxyBase = '') {
  const params = new URLSearchParams({ per_page: String(per_page), page: String(page) });
  if (branch) params.set('sha', branch);
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?` + params.toString(), {}, proxyBase);
}