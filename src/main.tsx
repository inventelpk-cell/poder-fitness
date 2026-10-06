import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { PoderProvider } from './state/store'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Falta el nodo raíz')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PoderProvider>
        <App />
      </PoderProvider>
    </BrowserRouter>
  </StrictMode>,
)
