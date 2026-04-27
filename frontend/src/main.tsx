import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { registerServiceWorker } from './pwa/registerServiceWorker'

const rootElement = document.getElementById('root')

registerServiceWorker()

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
