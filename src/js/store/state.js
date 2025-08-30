export const state = {
  mode: 'public', // 'public' | 'private'
  repo: null,
  branches: [],
  commits: [],
  ui: {
    loading: false,
    error: null
  },
  config: {
    // if you run the demo proxy server, set it to e.g. http://localhost:3000/api
    proxyBase: '' // default empty -> use direct GitHub API
  }
};