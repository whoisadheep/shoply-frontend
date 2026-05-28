const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const apiFetchFunc = `const apiFetch = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { ...options.headers };
  if (session) {
    headers['Authorization'] = \`Bearer \${session.access_token}\`;
  }
  return fetch(url, { ...options, headers });
};`;

code = code.replace(
  /const API_BASE_URL = 'http:\/\/192\.168\.1\.6:3001\/api';/,
  `const API_BASE_URL = 'http://192.168.1.6:3001/api';\n\n${apiFetchFunc}`
);

code = code.replace(/fetch\(/g, 'apiFetch(');

// Fix the one inside apiFetch itself back to standard fetch
code = code.replace(/return apiFetch\(url, \{ \.\.\.options/g, 'return fetch(url, { ...options');

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx patched successfully');
