import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createExpressChangelogRouter } from 'changelog-sdk/express'

const app = express()
const port = Number(process.env.PORT || 5174)

app.use('/api/changelog', createExpressChangelogRouter())

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const clientDist = path.resolve(__dirname, '../dist')

  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Changelog API listening on http://localhost:${port}`)
})
