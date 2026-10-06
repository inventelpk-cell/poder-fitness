/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import type { RankId } from './catalog/types';

interface TransformHandle {
  reproducir: (desde: RankId, hacia: RankId) => void;
  mostrar: (id: RankId, etiqueta?: string) => void;
  destruir: () => void;
}

declare global {
  interface Window {
    PoderTransformacion?: {
      iniciar: (
        root: HTMLElement,
        opciones?: {
          desde?: RankId;
          hacia?: RankId;
          auto?: boolean;
          controles?: boolean;
          teclas?: boolean;
          reducido?: boolean;
          alTerminar?: (message: { type: string; desde: RankId; hacia: RankId }) => void;
        },
      ) => TransformHandle;
    };
  }
}
