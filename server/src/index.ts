import { createServer } from 'node:http'
import { config } from './config.ts'
import './db.ts' // initialize schema on boot
import { Router, HttpError, json, readBody, type Ctx } from './http.ts'
import { registerRoutes } from './routes.ts'

const router = new Router()
registerRoutes(router)

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': config.corsOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-staff-key',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    })
    res.end()
    return
  }

  if (url.pathname === '/health' || url.pathname === '/') {
    json(res, 200, { ok: true, service: 'pressd-server', time: new Date().toISOString() })
    return
  }

  const match = router.match(req.method ?? 'GET', url.pathname)
  if (!match) {
    json(res, 404, { error: 'Not found' })
    return
  }

  try {
    const body = req.method === 'GET' || req.method === 'DELETE' ? undefined : await readBody(req)
    const ctx: Ctx = { req, res, params: match.params, query: url.searchParams, body }
    await match.handler(ctx)
  } catch (err) {
    if (err instanceof HttpError) {
      json(res, err.status, { error: err.message })
    } else {
      console.error('[pressd] unhandled error:', err)
      json(res, 500, { error: 'Internal server error' })
    }
  }
})

server.listen(config.port, () => {
  console.log(`[pressd] API listening on http://localhost:${config.port}`)
})
