import { useEffect, useRef, type ReactElement } from 'react';
import type { RankId } from '../catalog/types';
import { labelRank } from '../domain/labels';
import '../../design/transformation/transformation.css';

export function Transformacion({
  desde,
  hacia,
  onDone,
}: {
  desde: RankId;
  hacia: RankId;
  onDone: () => void;
}): ReactElement {
  const scene = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const nombre = labelRank(hacia);

  useEffect(() => {
    const nodo = scene.current;
    const api = window.PoderTransformacion;
    if (!nodo || !api) return;
    const control = api.iniciar(nodo, {
      desde,
      hacia,
      auto: true,
      controles: false,
      teclas: false,
      alTerminar() {
        return undefined;
      },
    });
    title.current?.focus();
    return () => control.destruir();
  }, [desde, hacia]);

  useEffect(() => {
    const root = scene.current?.parentElement;
    if (!root) return;
    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Tab') return;
      const items = [...root!.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
        (element) => !element.hasAttribute('disabled'),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="transform-screen" role="dialog" aria-modal="true" aria-labelledby="transform-title">
      <div ref={scene} className="pf-transform" data-rank={desde}>
        <div className="vignette" aria-hidden="true" />
        <div className="speed" aria-hidden="true" />
        <div className="content">
          <div className="emblem-wrap">
            <div className="aura" aria-hidden="true" />
            <div className="shock" aria-hidden="true" />
            <div className="sparks" aria-hidden="true" />
            <div className="emblem" />
          </div>
          <p className="kicker">Rango actual</p>
          <h1 className="rank-name" id="rankName">
            {nombre}
          </h1>
          <p className="flavor" />
        </div>
        <div className="frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="flash" aria-hidden="true" />
      </div>
      <div className="transform-copy">
        <h2 id="transform-title" tabIndex={-1} ref={title}>
          Rango {nombre}
        </h2>
        <p>Tu nivel de poder entra en {nombre}.</p>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Seguir
        </button>
      </div>
    </div>
  );
}
