import crypto from 'node:crypto'

const REQUIRED_KEY_BYTES = 32

function getRawKey(): Buffer {
  const raw = process.env.CHANGELOG_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('CHANGELOG_ENCRYPTION_KEY is not configured')
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('CHANGELOG_ENCRYPTION_KEY is empty')
  }

  let key: Buffer
  if (trimmed.startsWith('base64:')) {
    key = Buffer.from(trimmed.slice(7), 'base64')
  } else if (trimmed.startsWith('hex:')) {
    key = Buffer.from(trimmed.slice(4), 'hex')
  } else {
    key = Buffer.from(trimmed, 'base64')
  }

  if (key.length !== REQUIRED_KEY_BYTES) {
    throw new Error(`CHANGELOG_ENCRYPTION_KEY must be ${REQUIRED_KEY_BYTES} bytes`)
  }

  return key
}

export function hasEncryptionKey(): boolean {
  try {
    getRawKey()
    return true
  } catch {
    return false
  }
}

export function encryptSecret(value: string): { encrypted: string; iv: string; tag: string } {
  const key = getRawKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decryptSecret(input: { encrypted: string; iv: string; tag: string }): string {
  const key = getRawKey()
  const iv = Buffer.from(input.iv, 'base64')
  const tag = Buffer.from(input.tag, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(Buffer.from(input.encrypted, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
}
