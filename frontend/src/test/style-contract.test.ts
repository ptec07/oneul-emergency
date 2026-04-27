import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('mobile emergency UX style contract', () => {
  const css = readFileSync(resolve(__dirname, '../styles.css'), 'utf-8')

  it('styles emergency detail, map preview, offline note, and mobile card actions', () => {
    expect(css).toContain('.facility-detail')
    expect(css).toContain('.map-preview')
    expect(css).toContain('.offline-note')
    expect(css).toContain('@media (max-width: 560px)')
    expect(css).toContain('.facility-card__details')
  })
})
