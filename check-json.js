const fs = require('fs');
try {
  const d = fs.readFileSync('messages/en.json', 'utf8');
  const j = JSON.parse(d);
  console.log('Has Supplements:', !!j.Supplements);
  console.log('Supplements keys count:', Object.keys(j.Supplements || {}).length);
  console.log('First 10 keys:', Object.keys(j.Supplements || {}).slice(0, 10));
} catch (e) {
  console.error('JSON Error:', e.message);
}