import { config } from './config.ts'
import { db } from './db.ts'
import { buildServer } from './app.ts'

const server = buildServer()

server.listen(config.port, () => {
  console.log(`[pressd] API listening on http://localhost:${config.port}`)
})

// Graceful shutdown: stop accepting connections, then close the DB.
let shuttingDown = false
function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`[pressd] ${signal} received, shutting down…`)
  server.close(() => {
    try {
      db.close()
    } catch {
      /* already closed */
    }
    process.exit(0)
  })
  // force-exit if connections linger
  setTimeout(() => process.exit(0), 3000).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
