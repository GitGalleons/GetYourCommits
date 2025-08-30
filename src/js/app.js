import { state } from './store/state.js';
import * as github from './services/githubService.js';
import * as ui from './ui/uiRenderer.js';
import * as tokenMgr from './auth/tokenManager.js';

const el = {
  tabPublic: document.getElementById('tab-public'),
  tabPrivate: document.getElementById('tab-private'),
  formPublic: document.getElementById('form-public'),
  formPrivate: document.getElementById('form-private'),
  publicOwner: document.getElementById('public-owner'),
  publicRepo: document.getElementById('public-repo'),
  btnSearchPublic: document.getElementById('btn-search-public'),
  privateOwner: document.getElementById('private-owner'),
  privateRepo: document.getElementById('private-repo'),
  privateToken: document.getElementById('private-token'),
  btnSearchPrivate: document.getElementById('btn-search-private'),
  btnClearToken: document.getElementById('btn-clear-token'),
  repoSection: document.getElementById('repo-section'),
  commitsSection: document.getElementById('commits-section')
};

function switchMode(mode) {
  state.mode = mode;
  el.tabPublic.classList.toggle('active', mode === 'public');
  el.tabPrivate.classList.toggle('active', mode === 'private');
  el.formPublic.classList.toggle('hidden', mode !== 'public');
  el.formPrivate.classList.toggle('hidden', mode !== 'private');
}

el.tabPublic.addEventListener('click', () => switchMode('public'));
el.tabPrivate.addEventListener('click', () => switchMode('private'));

el.btnClearToken.addEventListener('click', () => {
  tokenMgr.clearToken();
  el.privateToken.value = '';
  alert('Token cleared from session (demo). For production, tokens should never be stored client-side.');
});

async function loadRepo(owner, repo, useProxy = false) {
  state.ui.loading = true;
  ui.showLoading(el.repoSection, 'Loading repository…');
  try {
    const proxyBase = useProxy ? state.config.proxyBase : '';
    const { data: repoData } = await github.getRepo(owner, repo, proxyBase);
    state.repo = repoData;
    ui.renderRepo(el.repoSection, repoData);

    // load branches
    ui.showLoading(el.commitsSection, 'Loading branches…');
    const { data: branches } = await github.listBranches(owner, repo, proxyBase);
    state.branches = branches;
    const select = document.getElementById('branch-select');
    ui.renderBranches(select, branches);
    // select default branch
    if (repoData.default_branch) {
      select.value = repoData.default_branch;
    }
    // listen branch change
    select.addEventListener('change', () => {
      loadCommits(owner, repo, select.value, useProxy);
    });
    // load commits for selected branch
    await loadCommits(owner, repo, select.value, useProxy);
  } catch (err) {
    state.ui.error = err.message || String(err);
    ui.showError(el.repoSection, state.ui.error);
    ui.showError(el.commitsSection, state.ui.error);
  } finally {
    state.ui.loading = false;
  }
}

async function loadCommits(owner, repo, branch, useProxy = false) {
  ui.showLoading(el.commitsSection, 'Loading commits…');
  try {
    const proxyBase = useProxy ? state.config.proxyBase : '';
    const { data: commits } = await github.listCommits(owner, repo, branch, 30, 1, proxyBase);
    state.commits = commits;
    ui.renderCommits(el.commitsSection, commits, owner, repo);
  } catch (err) {
    ui.showError(el.commitsSection, err.message || String(err));
  }
}

// Public search
el.btnSearchPublic.addEventListener('click', async () => {
  const owner = el.publicOwner.value.trim();
  const repo = el.publicRepo.value.trim();
  if (!owner || !repo) {
    alert('owner and repo required');
    return;
  }
  await loadRepo(owner, repo, false);
});

// Private search
el.btnSearchPrivate.addEventListener('click', async () => {
  const owner = el.privateOwner.value.trim();
  const repo = el.privateRepo.value.trim();
  const token = el.privateToken.value.trim();
  if (!owner || !repo || !token) {
    alert('owner, repo, and token are required for private mode');
    return;
  }
  // For demo only: store token in sessionStorage
  tokenMgr.setToken(token);
  // If you have a proxy server, set state.config.proxyBase = 'http://localhost:3000/api' or similar in code or via UI.
  const useProxy = !!state.config.proxyBase;
  await loadRepo(owner, repo, useProxy);
});

// Quick initialization: if user previously stored token in sessionStorage, fill field
document.addEventListener('DOMContentLoaded', () => {
  const existing = tokenMgr.getToken();
  if (existing) el.privateToken.value = existing;
});