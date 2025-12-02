// Minimal Node.js test client
// Usage: node tests/test-node.js "https://YOUR-VERCEL-APP.vercel.app/api/chatgpt-proxy?target=hx2test"

const https = require('https');
const url = require('url');

const target = process.argv[2];
if (!target) {
  console.error('Usage: node tests/test-node.js "<proxy-url>?target=hx2test"');
  process.exit(1);
}

https.get(target, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
