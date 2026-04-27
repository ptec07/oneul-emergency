import { describe, expect, it, vi } from 'vitest'

import { registerServiceWorker } from './registerServiceWorker'

describe('registerServiceWorker', () => {
  it('registers the app service worker when the browser supports it', async () => {
    const register = vi.fn().mockResolvedValue({ scope: '/' })
    const eventListeners: Record<string, () => void> = {}
    const fakeWindow = {
      addEventListener: vi.fn((event: string, callback: () => void) => {
        eventListeners[event] = callback
      }),
    }
    const fakeNavigator = { serviceWorker: { register } }

    registerServiceWorker(fakeWindow as unknown as Window, fakeNavigator as unknown as Navigator)
    await eventListeners.load()

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('does nothing when service workers are not supported', () => {
    const fakeWindow = { addEventListener: vi.fn() }
    const fakeNavigator = {}

    registerServiceWorker(fakeWindow as unknown as Window, fakeNavigator as unknown as Navigator)

    expect(fakeWindow.addEventListener).not.toHaveBeenCalled()
  })
})
