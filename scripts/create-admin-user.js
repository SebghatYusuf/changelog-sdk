#!/usr/bin/env node

import bcryptjs from 'bcryptjs'
import mongoose from 'mongoose'
import { createInterface } from 'readline'

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    collection: 'admin_users',
  }
)

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema)

function getMongoUri() {
  const uri = process.env.CHANGELOG_MONGODB_URI || process.env.MONGODB_URI
  if (!uri) {
    throw new Error('CHANGELOG_MONGODB_URI (or MONGODB_URI) is required')
  }
  return uri
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function defaultDisplayName(email) {
  const localPart = email.split('@')[0] || 'admin'
  return localPart.slice(0, 120)
}

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function resolveInputs() {
  const emailArg = process.argv[2]
  const passwordArg = process.argv[3]
  const displayNameArg = process.argv[4]

  const email = normalizeEmail(emailArg || (await prompt('Admin email: ')))
  const password = String(passwordArg || (await prompt('Admin password (min 8 chars): '))).trim()
  const displayName = String(displayNameArg || (await prompt('Display name (optional): '))).trim()

  if (!email || !email.includes('@')) {
    throw new Error('A valid email is required')
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  return {
    email,
    password,
    displayName: displayName || defaultDisplayName(email),
  }
}

async function createAdminUser() {
  const mongoUri = getMongoUri()
  const { email, password, displayName } = await resolveInputs()

  await mongoose.connect(mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })

  try {
    const existing = await AdminUser.findOne({ email }).lean()
    if (existing) {
      console.log(`\nAdmin user already exists for ${email}.`)
      return
    }

    const passwordHash = await bcryptjs.hash(password, 10)
    await AdminUser.create({ email, passwordHash, displayName })

    console.log('\nAdmin user created successfully.')
    console.log(`Email: ${email}`)
    console.log(`Display name: ${displayName}`)
    console.log('You can now log in through the SDK admin login form.')
  } finally {
    await mongoose.disconnect()
  }
}

createAdminUser().catch((error) => {
  console.error(`\nFailed to create admin user: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
