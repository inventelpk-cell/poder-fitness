import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/archivo-black/400.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '../design/effects/tokens.css';
import '../design/effects/aura.css';
import { App } from './app/App';
import './styles/global.css';
import './styles/manga.css';

registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('No está el nodo raíz.');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
