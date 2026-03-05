import mongoose, { Mongoose } from 'mongoose'

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

export async function connectDB(): Promise<Mongoose> {
  const mongoUri = process.env.CHANGELOG_MONGODB_URI

  if (!mongoUri) {
    throw new Error('CHANGELOG_MONGODB_URI environment variable is not defined')
  }

  // Return cached connection if available
  if (cached.conn) {
    return cached.conn
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
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
