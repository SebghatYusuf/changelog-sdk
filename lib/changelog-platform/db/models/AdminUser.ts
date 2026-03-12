import mongoose, { Schema } from 'mongoose'

interface AdminUserModelFields {
  email: string
  passwordHash: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}

const adminUserSchema = new Schema<AdminUserModelFields>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [320, 'Email must be less than 320 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [120, 'Display name must be less than 120 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'admin_users',
  }
)

adminUserSchema.index({ email: 1 }, { unique: true })

export const AdminUser =
  (mongoose.models.AdminUser as mongoose.Model<AdminUserModelFields>) ||
  mongoose.model<AdminUserModelFields>('AdminUser', adminUserSchema)

export default AdminUser
