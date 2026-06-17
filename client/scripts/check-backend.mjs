import http from 'http';

function ping() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5000/api/products', (res) => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

const ok = await ping();

if (ok) {
  console.log('✅ Backend detected on http://localhost:5000');
} else {
  console.log('');
  console.log('⚠️  BACKEND NOT RUNNING on port 5000');
  console.log('   API / socket errors are expected until you start the server.');
  console.log('');
  console.log('   Option 1 (recommended) — from project root:');
  console.log('     cd ..');
  console.log('     npm run dev');
  console.log('');
  console.log('   Option 2 — separate terminal:');
  console.log('     cd ../server');
  console.log('     npm run dev');
  console.log('');
}