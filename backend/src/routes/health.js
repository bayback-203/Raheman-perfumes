import { Router } from 'express'
import mongoose from 'mongoose'
import { cache } from '../lib/cache.js'
import { queue } from '../lib/queue.js'
import { circuitRegistry } from '../lib/circuitBreaker.js'

const router = Router()

/**
 * 1. Liveness Probe (Kubernetes / AWS ECS / Docker Swarm)
 * Fast check: Is the process responsive and alive?
 */
router.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'live', timestamp: new Date().toISOString() })
})

/**
 * 2. Readiness Probe
 * Deep check: Are critical upstream dependencies (MongoDB, Cache, Queue) ready to receive user traffic?
 * Returns 503 if MongoDB is disconnected so load balancers stop sending traffic here.
 */
router.get('/health/ready', (_req, res) => {
  const dbReady = mongoose.connection?.readyState === 1 // 1 = connected
  if (!dbReady) {
    return res.status(503).json({
      status: 'unready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    })
  }

  res.status(200).json({
    status: 'ready',
    database: 'connected',
    cache: cache.stats(),
    queue: queue.stats(),
    timestamp: new Date().toISOString(),
  })
})

/**
 * 3. Full System Telemetry
 * Provides complete operational metrics for monitoring dashboards.
 */
router.get('/health', (_req, res) => {
  const mem = process.memoryUsage()
  const circuits = {}
  for (const [name, breaker] of circuitRegistry.entries()) {
    circuits[name] = breaker.stats()
  }

  res.status(200).json({
    status: 'ok',
    service: 'rehman-perfume-api',
    env: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      state: mongoose.STATES[mongoose.connection?.readyState] || 'unknown',
      host: mongoose.connection?.host || 'unknown',
      name: mongoose.connection?.name || 'unknown',
    },
    cache: cache.stats(),
    queue: queue.stats(),
    circuits,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  })
})

export default router

