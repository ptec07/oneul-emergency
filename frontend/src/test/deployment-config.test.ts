import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildApiUrl } from '../api/client'

const frontendRoot = resolve(__dirname, '../..')

describe('frontend deployment configuration', () => {
  it('has a Vercel SPA config that serves dist and falls back to the app shell', () => {
    const config = JSON.parse(readFileSync(resolve(frontendRoot, 'vercel.json'), 'utf-8'))

    expect(config.version).toBe(2)
    expect(config.outputDirectory).toBe('dist')
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' })
  })

  it('copies index.html to 404.html during build for static SPA fallback', () => {
    const packageJson = JSON.parse(readFileSync(resolve(frontendRoot, 'package.json'), 'utf-8')) as { scripts?: Record<string, string> }

    expect(packageJson.scripts?.build).toContain('cp dist/index.html dist/404.html')
  })

  it('can build API URLs against a separate deployed backend origin', () => {
    expect(buildApiUrl('/emergency-rooms?lat=1', 'https://oneul-api.onrender.com')).toBe(
      'https://oneul-api.onrender.com/emergency-rooms?lat=1',
    )
    expect(buildApiUrl('/emergency-rooms?lat=1', '/api')).toBe('/api/emergency-rooms?lat=1')
  })
})
