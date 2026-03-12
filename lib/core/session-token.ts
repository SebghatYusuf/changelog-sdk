const HEX_RE = /^[a-fA-F0-9]+$/

// When checking expiry, allow tokens that expired within this window to account
// for minor clock skew between the token-issuing server and the verifying server.
const CLOCK_SKEW_SECONDS = 5

function toArrayBuffer(input: string): ArrayBuffer {
  return new TextEncoder().encode(input).buffer as ArrayBuffer
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!HEX_RE.test(hex) || hex.length % 2 !== 0) return null

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16)
  }

  return bytes
}

async function sign(payload: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, toArrayBuffer(payload))
  return new Uint8Array(signature)
}

function secureEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length || a.length === 0) return false

  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i]
  }

  return diff === 0
}

// 12 bytes (96 bits) is chosen for the nonce: it provides ~2^96 collision resistance,
// well above NIST SP 800-90A's 112-bit recommendation for random values, while keeping
// token length compact. The HMAC signature already provides secret-keyed uniqueness;
// the nonce's sole purpose is to prevent two sessions created at the same second from
// sharing an identical payload, so 96 bits is more than sufficient.
function createNonceHex(size = 12): string {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

export function getValidSessionSecret(candidates: Array<string | undefined>, minLength = 32): string | undefined {
  for (const candidate of candidates) {
    const normalized = candidate?.trim()
    if (normalized && normalized.length >= minLength) {
      return normalized
    }
  }

  return undefined
}

export async function createSignedSessionToken(secret: string, ttlSeconds: number): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds
  const nonce = createNonceHex(12)
  const payload = `${expiresAt}.${nonce}`
  const signature = await sign(payload, secret)
  return `${payload}.${bytesToHex(signature)}`
}

export async function verifySignedSessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [expiresAtRaw, nonce, providedSignatureRaw] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000) - CLOCK_SKEW_SECONDS) {
    return false
  }

  const payload = `${expiresAtRaw}.${nonce}`
  const expectedSignature = await sign(payload, secret)
  const providedSignature = hexToBytes(providedSignatureRaw)
  if (!providedSignature) return false

  return secureEquals(providedSignature, expectedSignature)
}
