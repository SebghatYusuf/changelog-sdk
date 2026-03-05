#!/usr/bin/env node

const bcryptjs = require('bcryptjs');

// Get password from CLI argument or use default
const password = process.argv[2] || 'admin123';

try {
  const hash = bcryptjs.hashSync(password, 10);
  const escapedHash = hash.replace(/\$/g, '\\$');
  console.log('\n✅ Generated password hash:\n');
  console.log(hash);
  console.log('\n📝 Add this to your .env.local:\n');
  console.log(`CHANGELOG_ADMIN_PASSWORD=${escapedHash}\n`);
} catch (error) {
  console.error('❌ Error hashing password:', error.message);
  process.exit(1);
}
