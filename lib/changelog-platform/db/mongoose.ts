import mongoose, { Mongoose } from 'mongoose'
import { logEnvOnce, sanitizeMongoUri } from '../../core/log'

/**
 * Singleton MongoDB connection with Mongoose
 * Prevents "Too many connections" errors during HMR
 */

interface CachedConnection {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

declare global {
  var mongooseCache: CachedConnection
}

let cached: CachedConnection = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

// Disable query buffering globally so disconnected states fail fast.
mongoose.set('bufferCommands', false)

function getMongoUri(): string {
  const raw = process.env.CHANGELOG_MONGODB_URI || process.env.MONGODB_URI
  logEnvOnce('mongo.uri', {
    CHANGELOG_MONGODB_URI: sanitizeMongoUri(process.env.CHANGELOG_MONGODB_URI),
    MONGODB_URI: sanitizeMongoUri(process.env.MONGODB_URI),
  })
  const uri = raw
  if (!uri) {
    throw new Error('CHANGELOG_MONGODB_URI environment variable is not defined')
  }
  return uri
}

export async function connectDB(): Promise<Mongoose> {
  const mongoUri = getMongoUri()
  const readyState = mongoose.connection.readyState

  // 1 = connected
  if (readyState === 1 && cached.conn) {
    return cached.conn
  }

  // 2 = connecting
  if (readyState === 2 && cached.promise) {
    cached.conn = await cached.promise
    return cached.conn
  }

  // 0 = disconnected, 3 = disconnecting
  // Reset stale cache and reconnect.
  if (readyState === 0 || readyState === 3) {
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (err) {
    cached.promise = null
    throw err
  }
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
  }
}

export default connectDB
