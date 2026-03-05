import mongoose, { Schema } from 'mongoose'
import { ChangelogTag } from '../../types/changelog'

/**
 * Changelog Mongoose Model
 */

interface ChangelogModelFields {
  title: string
  slug: string
  content: string
  version: string
  date: Date
  status: 'draft' | 'published'
  tags: ChangelogTag[]
  aiGenerated: boolean
  rawNotes: string | null
}

const changelogSchema = new Schema<ChangelogModelFields>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title must be less than 200 characters'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: {
      type: [String],
      enum: ['Features', 'Fixes', 'Improvements', 'Breaking', 'Security', 'Performance', 'Docs'],
      required: [true, 'At least one tag is required'],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    rawNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'changelogs',
  }
)

// Create index for slug (for fast lookups)
changelogSchema.index({ slug: 1 })
changelogSchema.index({ status: 1, date: -1 })
changelogSchema.index({ tags: 1 })

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate slug before validation so `required: true` passes.
changelogSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    const slug = slugifyTitle(this.title)
    this.slug = slug || `release-${Date.now()}`
  }
})

export const Changelog =
  (mongoose.models.Changelog as mongoose.Model<ChangelogModelFields>) ||
  mongoose.model<ChangelogModelFields>('Changelog', changelogSchema)

export default Changelog
