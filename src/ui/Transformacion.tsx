import { useEffect, useState, useRef, type ReactElement } from 'react';
import type { RankId } from '../catalog/types';
import { unlockAudio, playRankRise } from '../audio/tones';
import { labelRank } from '../domain/labels';
import { useApp } from '../state/app-state';
import { Avatar } from './Avatar';
import { CoachBubble } from './CoachBubble';

type Phase = 'desde' | 'salto' | 'destino';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Transformacion({
  desde,
  hacia,
  onDone,
}: {
  desde: RankId;
  hacia: RankId;
  onDone: () => void;
}): ReactElement {
  const { profile } = useApp();
  const title = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 'destino' : 'desde');
  const [ready, setReady] = useState(reduced);
  const nombre = labelRank(hacia);
  const gender = profile?.avatar ?? 'hombre';
  const rank = phase === 'desde' ? desde : hacia;

  useEffect(() => {
    unlockAudio();
    playRankRise(profile?.sound ?? false, reduced);
    if (reduced) {
      title.current?.focus();
      return;
    }
    const salto = window.setTimeout(() => setPhase('salto'), 520);
    const destino = window.setTimeout(() => setPhase('destino'), 1100);
    const done = window.setTimeout(() => {
      setReady(true);
      title.current?.focus();
    }, 1500);
    return () => {
      window.clearTimeout(salto);
      window.clearTimeout(destino);
      window.clearTimeout(done);
    };
  }, [profile?.sound, reduced]);

  useEffect(() => {
    const nodo = root.current;
    if (!nodo) return;
    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Tab') return;
      const items = [...nodo!.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1 && !element.hidden && element.offsetParent !== null,
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
    nodo.addEventListener('keydown', onKey);
    return () => nodo.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="transform-screen" role="dialog" aria-modal="true" aria-labelledby="transform-title" ref={root}>
      <div className={`manga-transform is-${phase} pf-aura pf-aura--${rank}`} data-rank={rank}>
        {phase === 'salto' ? <div className="manga-flash" aria-hidden="true" /> : null}
        <Avatar gender={gender} rank={rank} pose={phase === 'salto' ? 'transformacion' : undefined} className="transform-avatar" />
      </div>
      <div className="transform-caption">
        <CoachBubble event="rango" />
        <p className={`rank-pill pf-aura--${hacia}`}>{nombre}</p>
        <div className="transform-follow" hidden={!ready}>
          <h2 id="transform-title" tabIndex={-1} ref={title}>
            Rango {nombre}
          </h2>
          <p>Tu nivel de poder entra en {nombre}.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(event) => {
              event.stopPropagation();
              onDone();
            }}
          >
            Seguir
          </button>
        </div>
      </div>
    </div>
  );
}
