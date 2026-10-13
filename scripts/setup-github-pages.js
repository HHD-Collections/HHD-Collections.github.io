import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tokensFile = path.join(rootDir, 'Github Access Tokens.txt');
const content = fs.readFileSync(tokensFile, 'utf8');
const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

let token = '';
for (const line of lines) {
  if (line.startsWith('ghp_')) {
    token = line;
    break;
  }
}

async function enablePages() {
  const owner = 'HHD-Collections';
  const repo = 'HHD-Collections.github.io';

  console.log(`Enabling GitHub Pages for ${owner}/${repo}...`);

  // Enable Pages with workflow build type
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'HHD-Collections-Deployer',
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      build_type: 'workflow',
      source: {
        branch: 'main',
        path: '/',
      },
    }),
  });

  if (res.status === 201 || res.status === 200) {
    const data = await res.json();
    console.log(`✓ GitHub Pages enabled: ${data.html_url}`);
  } else if (res.status === 409) {
    console.log('GitHub Pages already enabled for this repository.');
  } else {
    console.log(`GitHub Pages config response (${res.status}):`, await res.text());
  }

  // Check workflow runs
  console.log('Checking GitHub Actions workflow runs...');
  const runsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'HHD-Collections-Deployer',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (runsRes.ok) {
    const runsData = await runsRes.json();
    console.log(`Found ${runsData.total_count} workflow run(s).`);
    if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
      const latest = runsData.workflow_runs[0];
      console.log(`Latest run #${latest.run_number} (${latest.name}): Status = ${latest.status}, Conclusion = ${latest.conclusion || 'in_progress'}`);
      console.log(`URL: ${latest.html_url}`);
    }
  }
}

enablePages().catch(console.error);
