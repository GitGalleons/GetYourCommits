import { escapeHtml } from '../utils/format.js';

export function showLoading(container, message = 'Loading…') {
  container.innerHTML = `<div class="loading">${escapeHtml(message)}</div>`;
}

export function showError(container, message) {
  container.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

export function renderRepo(container, repoData) {
  if (!repoData) {
    container.innerHTML = '';
    return;
  }
  const repo = repoData;
  const html = `
    <div class="repo-header">
      <div>
        <div><strong>${escapeHtml(repo.full_name)}</strong></div>
        <div class="repo-meta">
          <div class="pill">${escapeHtml(repo.private ? 'Private' : 'Public')}</div>
          <div class="pill">Default: ${escapeHtml(repo.default_branch)}</div>
          <div class="pill">Updated: ${escapeHtml(new Date(repo.updated_at).toLocaleString())}</div>
        </div>
      </div>
      <div>
        <label>
          Branch
          <select id="branch-select"></select>
        </label>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

export function renderBranches(selectEl, branches = []) {
  selectEl.innerHTML = '';
  branches.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.name;
    opt.textContent = b.name;
    selectEl.appendChild(opt);
  });
}

export function renderCommits(container, commits = [], owner = '', repo = '') {
  if (!commits || commits.length === 0) {
    container.innerHTML = '<div class="loading">No commits found for this branch.</div>';
    return;
  }
  const list = commits.map(c => {
    const sha = c.sha.slice(0, 7);
    const message = escapeHtml((c.commit && c.commit.message) || '(no message)');
    const authorName = escapeHtml((c.commit && c.commit.author && c.commit.author.name) || (c.author && c.author.login) || 'Unknown');
    const date = new Date((c.commit && c.commit.author && c.commit.author.date) || c.commit.committer.date).toLocaleString();
    const avatar = (c.author && c.author.avatar_url) || '';
    const url = c.html_url || `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commit/${encodeURIComponent(c.sha)}`;
    return `
      <div class="commit">
        <div class="avatar"><img src="${avatar}" alt="${authorName}" width="40" height="40" /></div>
        <div class="meta">
          <div class="message"><a href="${url}" target="_blank" rel="noopener noreferrer">${message}</a></div>
          <div class="author">${authorName} • <span class="sha">${sha}</span> • <small>${date}</small></div>
        </div>
      </div>
    `;
  }).join('\n');

  container.innerHTML = `<div class="commits-list">${list}</div>`;
}