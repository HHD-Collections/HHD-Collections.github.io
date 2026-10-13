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

async function run() {
  console.log('Verifying token with GitHub API...');
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'HHD-Collections-Deployer',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userRes.ok) {
    console.error('Failed to authenticate token:', userRes.status, await userRes.text());
    return;
  }

  const userData = await userRes.json();
  console.log(`Authenticated as GitHub user: ${userData.login}`);

  // Create repository HHD-Collections.github.io
  const repoName = `${userData.login}.github.io`;
  console.log(`Creating repository: ${repoName}...`);

  const createRes = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'HHD-Collections-Deployer',
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      description: 'HHD Collections — Luxury E-Commerce Website & Admin Dashboard',
      private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
    }),
  });

  if (createRes.status === 201) {
    const repoData = await createRes.json();
    console.log(`✓ Repository created successfully: ${repoData.html_url}`);
  } else if (createRes.status === 422) {
    console.log(`Repository ${repoName} already exists or name conflict.`);
  } else {
    console.log(`Create repository response: ${createRes.status}`, await createRes.text());
  }
}

run().catch(console.error);
