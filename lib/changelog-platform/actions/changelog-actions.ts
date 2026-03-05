'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcryptjs from 'bcryptjs'
import connectDB from '../db/mongoose'
import { Changelog } from '../db/models/Changelog'
import { CreateChangelogSchema, UpdateChangelogSchema, EnhanceChangelogSchema } from '../schemas/changelog'
import { enhanceChangelog } from '../ai/enhancer'
import { ChangelogEntry, EnhanceChangelogOutput } from '../types/changelog'

/**
 * Server Actions for Changelog CRUD and AI operations
 */

function toChangelogEntry(doc: any): ChangelogEntry {
  return {
    _id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    version: doc.version,
    date: new Date(doc.date),
    status: doc.status,
    tags: doc.tags,
    aiGenerated: Boolean(doc.aiGenerated),
    rawNotes: doc.rawNotes ?? undefined,
    createdAt: new Date(doc.createdAt ?? doc.date),
    updatedAt: new Date(doc.updatedAt ?? doc.date),
  }
}

// ===== CHANGELOG CRUD ACTIONS =====

export async function createChangelog(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()

    // Validate input
    const validated = CreateChangelogSchema.parse(input)

    // Create entry
    const changelog = new Changelog({
      title: validated.title,
      content: validated.content,
      version: validated.version,
      status: validated.status,
      tags: validated.tags,
      aiGenerated: validated.aiGenerated,
      rawNotes: validated.rawNotes,
    })

    await changelog.save()

    revalidatePath('/changelog')

    return {
      success: true,
      data: toChangelogEntry(changelog.toObject()),
    }
  } catch (error) {
    console.error('Error creating changelog:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create changelog',
    }
  }
}

export async function updateChangelog(input: unknown): Promise<{ success: boolean; data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()

    // Validate input
    const validated = UpdateChangelogSchema.parse(input)

    // Update entry
    const changelog = await Changelog.findByIdAndUpdate(
      validated.id,
      {
        ...(validated.title && { title: validated.title }),
        ...(validated.content && { content: validated.content }),
        ...(validated.version && { version: validated.version }),
        ...(validated.status && { status: validated.status }),
        ...(validated.tags && { tags: validated.tags }),
      },
      { new: true, runValidators: true }
    )

    if (!changelog) {
      return {
        success: false,
        error: 'Changelog entry not found',
      }
    }

    revalidatePath('/changelog')

    return {
      success: true,
      data: toChangelogEntry(changelog.toObject()),
    }
  } catch (error) {
    console.error('Error updating changelog:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update changelog',
    }
  }
}

export async function deleteChangelog(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    const result = await Changelog.findByIdAndDelete(id)

    if (!result) {
      return {
        success: false,
        error: 'Changelog entry not found',
      }
    }

    revalidatePath('/changelog')

    return { success: true }
  } catch (error) {
    console.error('Error deleting changelog:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete changelog',
    }
  }
}

// ===== AI ENHANCEMENT ACTION =====

export async function runAIEnhance(input: unknown): Promise<{ success: boolean; data?: EnhanceChangelogOutput; error?: string }> {
  try {
    // Validate input
    const validated = EnhanceChangelogSchema.parse(input)

    // Call AI enhancer
    const result = await enhanceChangelog(validated.rawNotes, validated.currentVersion)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Error in AI enhance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enhance changelog',
    }
  }
}

// ===== AUTHENTICATION ACTIONS =====

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminPassword = process.env.CHANGELOG_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim()

    if (!adminPassword) {
      return {
        success: false,
        error: 'Admin password not configured. If using a bcrypt hash in .env.local, escape "$" as "\\$".',
      }
    }

    // Support both bcrypt-hashed and plain text password values.
    // Hashes usually start with $2a$, $2b$, or $2y$.
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(adminPassword)
    const isValid = isBcryptHash ? await bcryptjs.compare(password, adminPassword) : password === adminPassword

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid password',
      }
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('changelog-admin-session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return { success: true }
  } catch (error) {
    console.error('Error logging in:', error)
    return {
      success: false,
      error: 'Authentication failed',
    }
  }
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('changelog-admin-session')
    return { success: true }
  } catch (error) {
    console.error('Error logging out:', error)
    return { success: false }
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return !!cookieStore.get('changelog-admin-session')?.value
  } catch {
    return false
  }
}

// ===== DATA FETCHING ACTIONS =====

export async function fetchChangelogBySlug(slug: string): Promise<{ data?: ChangelogEntry; error?: string }> {
  try {
    await connectDB()

    const changelog = await Changelog.findOne({ slug })

    if (!changelog) {
      return {
        error: 'Changelog not found',
      }
    }

    return {
      data: toChangelogEntry(changelog.toObject()),
    }
  } catch (error) {
    console.error('Error fetching changelog:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch changelog',
    }
  }
}

export async function fetchPublishedChangelogs(page: number = 1, limit: number = 10, tags?: string[], search?: string) {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const query: any = { status: 'published' }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }]
    }

    const total = await Changelog.countDocuments(query)
    const entries = await Changelog.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return {
      success: true,
      data: {
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      },
    }
  } catch (error) {
    console.error('Error fetching published changelogs:', error)
    return {
      success: true,
      data: {
        entries: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      },
    }
  }
}

export async function fetchAdminChangelogs(page: number = 1, limit: number = 20) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    await connectDB()

    const skip = (page - 1) * limit
    const total = await Changelog.countDocuments()
    const entries = await Changelog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return {
      success: true,
      data: {
        entries: entries.map(toChangelogEntry),
        total,
        page,
        limit,
        hasMore: page * limit < total,
      },
    }
  } catch (error) {
    console.error('Error fetching admin changelogs:', error)
    return {
      success: true,
      data: {
        entries: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      },
    }
  }
}
