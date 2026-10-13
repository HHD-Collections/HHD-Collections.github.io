import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tokensFile = path.join(rootDir, 'Github Access Tokens.txt');

if (!fs.existsSync(tokensFile)) {
  console.error('Github Access Tokens.txt not found.');
  process.exit(1);
}

const content = fs.readFileSync(tokensFile, 'utf8');
const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

// Find token (line starting with ghp_ or similar)
let token = '';
let username = 'HHD-Collections';

for (const line of lines) {
  if (line.startsWith('ghp_')) {
    token = line;
  } else if (line.toLowerCase().includes('user name')) {
    const parts = line.split(':');
    if (parts[1]) username = parts[1].trim();
  }
}

if (!token) {
  console.error('GitHub token not found in file.');
  process.exit(1);
}

console.log(`Found GitHub account credentials for ${username}.`);

// Test remote repositories
const repoCandidates = [
  'HHD-Collections.github.io',
  'hhd-collections',
];

let targetRepo = '';

for (const repo of repoCandidates) {
  const remoteUrl = `https://${username}:${token}@github.com/${username}/${repo}.git`;
  try {
    console.log(`Testing repository https://github.com/${username}/${repo}...`);
    execSync(`git ls-remote ${remoteUrl}`, { stdio: 'pipe' });
    targetRepo = repo;
    console.log(`✓ Repository exists: https://github.com/${username}/${repo}`);
    break;
  } catch (e) {
    console.log(`Repository ${repo} does not exist yet or is not accessible.`);
  }
}

if (!targetRepo) {
  // If neither exists, let's try creating it via GitHub API or default to HHD-Collections.github.io
  targetRepo = 'HHD-Collections.github.io';
  console.log(`Will attempt to target ${targetRepo}.`);
}

const pushUrl = `https://${username}:${token}@github.com/${username}/${targetRepo}.git`;

try {
  // Check if origin exists
  try {
    execSync('git remote remove origin', { cwd: rootDir, stdio: 'pipe' });
  } catch {}

  execSync(`git remote add origin ${pushUrl}`, { cwd: rootDir, stdio: 'pipe' });
  execSync('git branch -M main', { cwd: rootDir, stdio: 'pipe' });
  console.log('Pushing to GitHub (branch main)...');
  execSync('git push -u origin main --force', { cwd: rootDir, stdio: 'inherit' });
  console.log('✓ Successfully pushed to GitHub repository!');
} catch (err) {
  console.error('Git push encountered an issue:', err.message);
} finally {
  // Sanitize remote URL to avoid storing token in .git/config
  try {
    execSync(`git remote set-url origin https://github.com/${username}/${targetRepo}.git`, {
      cwd: rootDir,
      stdio: 'pipe',
    });
    console.log('✓ Sanitized git remote URL (removed token from git config).');
  } catch {}
}
