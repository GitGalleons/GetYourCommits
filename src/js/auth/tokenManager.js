// Simple token manager. For demo we store token in sessionStorage.
// Production: prefer server-side proxy and do NOT store tokens in browser.
const STORAGE_KEY = 'getcommits:token';

export function setToken(token) {
  if (!token) return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}