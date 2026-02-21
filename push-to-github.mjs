import { Octokit } from '@octokit/rest';

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('Token not found');

  const data = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const token = data?.settings?.access_token || data?.settings?.oauth?.credentials?.access_token;
  if (!token) throw new Error('GitHub not connected');
  return token;
}

const token = await getAccessToken();

// Set up git credentials and push
const { execSync } = await import('child_process');
const remote = `https://x-access-token:${token}@github.com/Spacemandomains/spaceman_domains.git`;

try {
  execSync(`git remote set-url origin "${remote}"`, { stdio: 'pipe' });
  const output = execSync('git push origin main', { stdio: 'pipe', encoding: 'utf-8' });
  console.log('Push successful!');
  console.log(output);
} catch (e) {
  console.error('Push output:', e.stderr || e.stdout || e.message);
} finally {
  // Reset remote to non-token URL
  execSync('git remote set-url origin https://github.com/Spacemandomains/spaceman_domains.git', { stdio: 'pipe' });
}
