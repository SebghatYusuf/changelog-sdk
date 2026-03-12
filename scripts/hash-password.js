#!/usr/bin/env node

import bcryptjs from 'bcryptjs'
import { createInterface } from 'readline'

async function getPassword() {
  const arg = process.argv[2]
  if (arg) return arg

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question('Enter admin password: ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

const password = await getPassword()

if (!password || !password.trim()) {
  console.error('\n❌ Password cannot be empty. Pass it as an argument or enter it when prompted.\n')
  console.error('  Usage: node scripts/hash-password.js <password>\n')
  process.exit(1)
}

try {
  const hash = bcryptjs.hashSync(password.trim(), 10)
  console.log('\n✅ Generated password hash:\n')
  console.log(hash)
  const escapedHash = hash.replace(/\$/g, '\\$')
  console.log('\n📋 Add this to your .env.local:\n')
  console.log(`CHANGELOG_ADMIN_PASSWORD=${escapedHash}\n`)
} catch (error) {
  console.error('❌ Error hashing password:', error.message)
  process.exit(1)
}
