import type { ReactElement } from 'react';
import type { Pattern, RankId } from '../catalog/types';
import { assertNever } from '../domain/assert';
import { labelPattern, labelRank } from '../domain/labels';

const BADGE_SRC: Record<string, string> = {
  'primera-sesion': '/design/badges/primera-sesion.svg',
  'cien-sesiones': '/design/badges/cien-entrenos.svg',
  'semana-completa': '/design/badges/semana-perfecta.svg',
  'cuatro-semanas': '/design/badges/arco-terminado.svg',
  'reto-completo': '/design/badges/reto-heroe.svg',
  'reto-siete': '/design/badges/racha-7.svg',
  'primer-record': '/design/badges/record-personal.svg',
  'volumen-10k': '/design/badges/volumen.svg',
};

export function RankEmblem({ id, size = 112 }: { id: RankId; size?: number }): ReactElement {
  const name = labelRank(id);
  return <img className="emblem" src={`/design/ranks/${id}.svg`} width={size} height={size} alt={`Rango ${name}`} />;
}

export function AchievementArt({ id, earned }: { id: string; earned: boolean }): ReactElement {
  const rankId = id.startsWith('rango-') ? id.slice('rango-'.length) : '';
  const src = rankId ? `/design/ranks/${rankId}.svg` : BADGE_SRC[id];
  if (src) {
    return <img className={earned ? 'medal' : 'medal is-dim'} src={src} width={72} height={72} alt="" />;
  }
  return <Medal earned={earned} />;
}

function arrow(d: string): ReactElement {
  return <path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
}

export function PatternDiagram({ patron }: { patron: Pattern }): ReactElement {
  const label = labelPattern(patron);
  let body: ReactElement;
  switch (patron) {
    case 'rodilla':
    case 'rodilla-unilateral':
      body = (
        <>
          {arrow('M62 18 L74 58 L52 102')}
          {arrow('M104 28 L104 78 M96 70 L104 82 L112 70')}
        </>
      );
      break;
    case 'cadera':
      body = (
        <>
          {arrow('M36 78 L78 78 L96 42')}
          {arrow('M108 58 L78 58 M86 50 L78 58 L86 66')}
        </>
      );
      break;
    case 'empuje-horizontal':
      body = (
        <>
          {arrow('M40 70 L70 70 L70 34 M58 34 L82 34')}
          {arrow('M96 78 L96 36 M88 44 L96 32 L104 44')}
        </>
      );
      break;
    case 'empuje-vertical':
      body = (
        <>
          {arrow('M48 96 L48 46 M36 46 L60 46')}
          {arrow('M90 88 L90 28 M82 38 L90 24 L98 38')}
        </>
      );
      break;
    case 'traccion-horizontal':
    case 'traccion-vertical':
      body = (
        <>
          {arrow('M34 40 L70 62 L34 84')}
          {arrow('M112 62 L78 62 M88 54 L76 62 L88 70')}
        </>
      );
      break;
    case 'core':
      body = (
        <>
          {arrow('M28 88 L132 88')}
          <rect x="48" y="48" width="64" height="28" fill="none" stroke="currentColor" strokeWidth="3" />
        </>
      );
      break;
    case 'biceps':
      body = arrow('M48 30 L48 70 L86 96');
      break;
    case 'triceps':
      body = arrow('M50 28 L78 58 L108 40');
      break;
    case 'hombro-aislamiento':
      body = arrow('M48 78 L48 50 L104 36');
      break;
    case 'femoral':
      body = arrow('M36 40 L70 40 L108 78 M96 66 L110 80 L92 88');
      break;
    case 'gemelo':
      body = (
        <>
          {arrow('M40 90 L120 90 L120 70 L70 70')}
          {arrow('M78 58 L78 28 M70 38 L78 24 L86 38')}
        </>
      );
      break;
    case 'acondicionamiento':
      body = (
        <>
          {arrow('M40 78 L58 78 M46 70 L40 78 L46 86')}
          {arrow('M102 42 L120 42 M112 34 L120 42 L112 50')}
        </>
      );
      break;
    case 'movilidad':
      body = arrow('M30 78 Q80 20 130 78 M48 40 L36 28 M40 48 L28 42 M112 40 L124 28 M120 48 L132 42');
      break;
    default:
      return assertNever(patron, 'patron');
  }
  return (
    <svg className="diagram" width="160" height="120" viewBox="0 0 160 120" role="img" aria-label={label}>
      {body}
    </svg>
  );
}

export function Medal({ earned }: { earned: boolean }): ReactElement {
  return (
    <svg className="medal" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      {earned ? <path d="M11 18 l5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2" /> : null}
    </svg>
  );
}
