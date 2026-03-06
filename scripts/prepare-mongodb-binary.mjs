import { MongoMemoryServer } from 'mongodb-memory-server'

const version = process.env.MONGOMS_VERSION || '7.0.24'
const downloadDir = process.env.MONGOMS_DOWNLOAD_DIR || '.cache/mongodb-binaries'

async function main() {
  const server = await MongoMemoryServer.create({
    binary: {
      version,
      downloadDir,
    },
    instance: {
      ip: '127.0.0.1',
    },
  })

  await server.stop()
  process.stdout.write(`MongoDB binary prepared (version ${version}) in ${downloadDir}\\n`)
}

main().catch((error) => {
  process.stderr.write(`Failed to prepare MongoDB binary: ${error instanceof Error ? error.message : String(error)}\\n`)
  process.exit(1)
})

